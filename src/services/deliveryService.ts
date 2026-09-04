import type {
  DeliveryAppointment,
  PdiItemStatus,
  GatePassRecord,
  DeliveryKpiSummary,
} from '../types/delivery';
import { SEED_DELIVERY_APPOINTMENTS } from '../data/seedDelivery';
import { inventoryService } from './inventoryService';
import { leadService } from './leadService';

const STORAGE_KEY = 'autopipeline_delivery_appointments';

export const deliveryService = {
  getAppointments(): DeliveryAppointment[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DELIVERY_APPOINTMENTS));
      return SEED_DELIVERY_APPOINTMENTS;
    }
    try {
      return JSON.parse(raw) as DeliveryAppointment[];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DELIVERY_APPOINTMENTS));
      return SEED_DELIVERY_APPOINTMENTS;
    }
  },

  getAppointmentById(id: string): DeliveryAppointment | undefined {
    return this.getAppointments().find((a) => a.id === id);
  },

  getAppointmentByLeadId(leadId: string): DeliveryAppointment | undefined {
    return this.getAppointments().find((a) => a.leadId === leadId);
  },

  updatePdiItem(
    appointmentId: string,
    itemId: string,
    status: PdiItemStatus,
    inspectorName: string = 'Ronaldo Cruz (QC Lead)'
  ): DeliveryAppointment {
    const appts = this.getAppointments();
    let updatedAppt: DeliveryAppointment | null = null;

    const next = appts.map((a) => {
      if (a.id === appointmentId) {
        const nextChecklist = a.pdiChecklist.map((item) =>
          item.id === itemId ? { ...item, status, inspectedBy: inspectorName } : item
        );
        const allPassed = nextChecklist.every((item) => item.status === 'passed');
        const anyRectify = nextChecklist.some((item) => item.status === 'rectify');

        let nextStatus = a.status;
        if (allPassed) {
          nextStatus = a.status === 'ceremony_active' || a.status === 'released' ? a.status : 'pdi_ready';
        } else if (anyRectify || nextChecklist.some((item) => item.status === 'passed')) {
          nextStatus = 'pdi_in_progress';
        }

        updatedAppt = {
          ...a,
          pdiChecklist: nextChecklist,
          status: nextStatus,
          qcSignedAt: allPassed ? new Date().toISOString() : a.qcSignedAt,
        };
        return updatedAppt;
      }
      return a;
    });

    if (!updatedAppt) throw new Error(`Appointment ${appointmentId} not found`);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return updatedAppt;
  },

  toggleHandoverKitItem(appointmentId: string, itemId: string): DeliveryAppointment {
    const appts = this.getAppointments();
    let updatedAppt: DeliveryAppointment | null = null;

    const next = appts.map((a) => {
      if (a.id === appointmentId) {
        const nextKit = a.handoverKit.map((item) =>
          item.id === itemId ? { ...item, verified: !item.verified } : item
        );
        updatedAppt = { ...a, handoverKit: nextKit };
        return updatedAppt;
      }
      return a;
    });

    if (!updatedAppt) throw new Error(`Appointment ${appointmentId} not found`);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return updatedAppt;
  },

  async generateGatePass(
    appointmentId: string,
    securityGuardOnDuty: string = 'SGV Officer Edgardo Santos',
    actorId: string = 'user-agent-1',
    actorName: string = 'Paolo Morales'
  ): Promise<{ appointment: DeliveryAppointment; gatePass: GatePassRecord }> {
    const appts = this.getAppointments();
    const appt = appts.find((a) => a.id === appointmentId);
    if (!appt) throw new Error(`Appointment ${appointmentId} not found`);

    const now = new Date();
    const passNumber = `GP-2026-0904-${appt.vin.slice(-4).toUpperCase()}`;

    const gatePass: GatePassRecord = {
      passNumber,
      issuedAt: now.toISOString(),
      vehicleVin: appt.vin,
      engineNumber: appt.engineNumber,
      conductionSticker: appt.conductionSticker,
      modelDescription: appt.modelInterest,
      customerName: appt.customerName,
      escortConsultantName: appt.salesConsultantName,
      securityGuardOnDuty,
      status: 'issued',
    };

    // 1. Advance lead stage to 'released' if not yet released
    try {
      const leads = await leadService.getLeads();
      const lead = leads.find((l) => l.id === appt.leadId);
      if (lead && lead.stage !== 'released') {
        await leadService.advanceStage(
          appt.leadId,
          `Ceremonial delivery complete. Gate Pass ${passNumber} issued.`,
          actorId,
          actorName
        );
      } else if (lead) {
        await leadService.addActivity(
          appt.leadId,
          actorId,
          actorName,
          'stage_change',
          `Security Gate Pass ${passNumber} issued. Vehicle cleared for lot exit.`
        );
      }
    } catch (err) {
      console.warn('Could not advance lead stage on gate pass:', err);
    }

    // 2. Update physical inventory status to 'released'
    if (appt.allocatedVehicleId) {
      try {
        const inventory = inventoryService.getInventory();
        const nextInv = inventory.map((v) =>
          v.id === appt.allocatedVehicleId ? { ...v, status: 'released' as const } : v
        );
        localStorage.setItem('autopipeline_inventory', JSON.stringify(nextInv));
      } catch (err) {
        console.warn('Could not update inventory status:', err);
      }
    }

    // 3. Update appointment
    const updatedAppt: DeliveryAppointment = {
      ...appt,
      status: 'released',
      gatePass,
    };

    const next = appts.map((a) => (a.id === appointmentId ? updatedAppt : a));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    return { appointment: updatedAppt, gatePass };
  },

  recordCsiFeedback(
    appointmentId: string,
    rating: number,
    feedback: string
  ): DeliveryAppointment {
    const appts = this.getAppointments();
    let updatedAppt: DeliveryAppointment | null = null;

    const next = appts.map((a) => {
      if (a.id === appointmentId) {
        updatedAppt = {
          ...a,
          csiRating: rating,
          csiFeedback: feedback,
        };
        return updatedAppt;
      }
      return a;
    });

    if (!updatedAppt) throw new Error(`Appointment ${appointmentId} not found`);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return updatedAppt;
  },

  getKpis(): DeliveryKpiSummary {
    const appts = this.getAppointments();
    const scheduledToday = appts.filter((a) => a.scheduledTime.includes('Today'));
    const pdiCompleted = appts.filter((a) =>
      ['pdi_ready', 'ceremony_active', 'released'].includes(a.status)
    );
    const handoverReady = appts.filter((a) =>
      a.handoverKit.filter((k) => k.required).every((k) => k.verified)
    );
    const gatePassesIssued = appts.filter((a) => a.gatePass !== undefined);

    const rated = appts.filter((a) => a.csiRating !== undefined);
    const avgCsi =
      rated.length > 0
        ? Number((rated.reduce((sum, a) => sum + (a.csiRating || 0), 0) / rated.length).toFixed(1))
        : 5.0;

    return {
      scheduledTodayCount: scheduledToday.length,
      pdiCompletedCount: pdiCompleted.length,
      handoverReadyCount: handoverReady.length,
      gatePassesIssuedCount: gatePassesIssued.length,
      averageCsiScore: avgCsi,
    };
  },
};
