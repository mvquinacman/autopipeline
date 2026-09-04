import type {
  ServiceAppointment,
  ConvertServiceToLeadInput,
  ServiceDriveKpiSummary,
  PitchStatus,
} from '../types/serviceDrive';
import type { Lead } from '../types/crm';
import { SEED_SERVICE_APPOINTMENTS } from '../data/seedServiceDrive';
import { leadService } from './leadService';
import { tradeInService } from './tradeInService';
import { formatPeso } from '../data/seed';

const STORAGE_KEY = 'autopipeline_service_appointments';

export const serviceDriveService = {
  getAppointments(): ServiceAppointment[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SERVICE_APPOINTMENTS));
      return SEED_SERVICE_APPOINTMENTS;
    }
    try {
      return JSON.parse(raw) as ServiceAppointment[];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SERVICE_APPOINTMENTS));
      return SEED_SERVICE_APPOINTMENTS;
    }
  },

  getAppointmentById(id: string): ServiceAppointment | undefined {
    return this.getAppointments().find((a) => a.id === id);
  },

  updatePitchStatus(
    appointmentId: string,
    status: PitchStatus,
    notes?: string
  ): ServiceAppointment {
    const appts = this.getAppointments();
    let target: ServiceAppointment | null = null;

    const next = appts.map((a) => {
      if (a.id === appointmentId) {
        target = {
          ...a,
          pitchStatus: status,
          pitchNotes: notes !== undefined ? notes : a.pitchNotes,
        };
        return target;
      }
      return a;
    });

    if (!target) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return target;
  },

  async convertServiceToLead(
    input: ConvertServiceToLeadInput
  ): Promise<{ appointment: ServiceAppointment; lead: Lead }> {
    const appt = this.getAppointmentById(input.appointmentId);
    if (!appt) {
      throw new Error(`Appointment ${input.appointmentId} not found`);
    }

    // 1. Create new lead in pipeline
    const newLead = await leadService.createLead(
      {
        customerName: appt.customerName,
        customerPhone: appt.customerPhone,
        customerEmail: appt.customerEmail,
        modelInterest: appt.suggestedUpgradeModel,
        estValue: appt.suggestedUpgradeMSRP,
        source: 'Service Drive Buyback',
        notes: `Service Drive Buyback Lead from Bay ${appt.bayNumber}. Current vehicle: ${appt.currentVehicleYear} ${appt.currentVehicleMake} ${appt.currentVehicleModel} (Plate: ${appt.currentPlateNumber}, ${appt.mileageKm.toLocaleString()} km). Positive net equity: ${formatPeso(appt.netEquity)}. In service for: ${appt.serviceType} (Estimated bill: ${formatPeso(appt.estimatedRepairBill)}). ${input.initialNote || ''}`,
      },
      input.assignedAgentId,
      input.assignedAgentName
    );

    // Advance lead from 'new' to 'contacted' since conversation happened in service drive
    const contactedLead = await leadService.advanceStage(
      newLead.id,
      'Initiated equity upgrade consultation at Service Drive',
      input.assignedAgentId,
      input.assignedAgentName
    );

    // 2. Automatically register pre-appraised trade-in
    const plateDigits = appt.currentPlateNumber.replace(/\D/g, '');
    const plateEnding = plateDigits.slice(-1) || '0';

    tradeInService.saveAppraisal({
      leadId: contactedLead.id,
      make: appt.currentVehicleMake,
      model: appt.currentVehicleModel,
      year: appt.currentVehicleYear,
      mileageKm: appt.mileageKm,
      transmission: 'automatic',
      condition: appt.mileageKm > 60000 ? 'fair' : 'good',
      appraisedValue: appt.estimatedMarketValue,
      existingLoanBalance: appt.estimatedLoanPayoff,
      plateEnding,
      appraiserName: `Service Advisor: ${appt.serviceAdvisorName}`,
      notes: `Service Drive inspection in Bay ${appt.bayNumber}. Maintenance bill: ${formatPeso(appt.estimatedRepairBill)}.`,
    });

    // 3. Mark appointment as converted
    const appts = this.getAppointments();
    let updatedAppt: ServiceAppointment | null = null;
    const next = appts.map((a) => {
      if (a.id === input.appointmentId) {
        updatedAppt = {
          ...a,
          pitchStatus: 'converted_to_lead',
          convertedLeadId: contactedLead.id,
        };
        return updatedAppt;
      }
      return a;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    return {
      appointment: updatedAppt || appt,
      lead: contactedLead,
    };
  },

  getKpis(): ServiceDriveKpiSummary {
    const appts = this.getAppointments();
    const highEquity = appts.filter((a) => a.opportunityType === 'high_positive_equity');
    const expiringWarranty = appts.filter(
      (a) => a.warrantyStatus === 'expiring_soon' || a.warrantyStatus === 'expired'
    );
    const totalPotentialTradeInValue = appts.reduce((sum, a) => sum + a.estimatedMarketValue, 0);
    const converted = appts.filter((a) => a.pitchStatus === 'converted_to_lead');

    return {
      activeVehiclesInService: appts.length,
      highEquityProspectsCount: highEquity.length,
      expiringWarrantyCount: expiringWarranty.length,
      totalPotentialTradeInValue,
      convertedLeadsCount: converted.length,
    };
  },
};
