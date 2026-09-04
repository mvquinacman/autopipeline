import type {
  VehicleStock,
  InventoryKpiSummary,
  ReserveVehicleInput,
  InventoryFilter,
} from '../types/inventory';
import { SEED_INVENTORY } from '../data/seedInventory';

let inventoryStore: VehicleStock[] = JSON.parse(JSON.stringify(SEED_INVENTORY));

export const inventoryService = {
  getInventory(filter?: InventoryFilter): VehicleStock[] {
    let result = [...inventoryStore];

    if (!filter) return result;

    if (filter.status && filter.status !== 'all') {
      if (filter.status === 'aged') {
        result = result.filter((v) => v.daysInStock > 60 && v.status === 'in_stock');
      } else {
        result = result.filter((v) => v.status === filter.status);
      }
    }

    if (filter.model && filter.model !== 'all') {
      const q = filter.model.toLowerCase();
      result = result.filter(
        (v) =>
          v.model.toLowerCase().includes(q) ||
          v.variant.toLowerCase().includes(q)
      );
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.vin.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.variant.toLowerCase().includes(q) ||
          v.color.toLowerCase().includes(q) ||
          v.engineNumber.toLowerCase().includes(q) ||
          v.lotLocation.toLowerCase().includes(q) ||
          (v.allocatedCustomerName && v.allocatedCustomerName.toLowerCase().includes(q))
      );
    }

    return result;
  },

  getVehicleById(id: string): VehicleStock | undefined {
    return inventoryStore.find((v) => v.id === id);
  },

  getVehicleByVin(vin: string): VehicleStock | undefined {
    return inventoryStore.find(
      (v) => v.vin.toLowerCase() === vin.toLowerCase().trim()
    );
  },

  getAvailableUnitsForModel(modelInterest: string): VehicleStock[] {
    const q = modelInterest.toLowerCase().trim();
    // Match model keywords (e.g. Fortuner, Prado, Hilux, Vios, Corolla, RAV4)
    const keywords = q.split(' ').filter((w) => w.length > 2);

    return inventoryStore.filter((v) => {
      const isAvailable = v.status === 'in_stock' || v.status === 'in_transit';
      if (!isAvailable) return false;

      const vStr = `${v.model} ${v.variant}`.toLowerCase();
      // Direct substring match
      if (vStr.includes(q) || q.includes(v.model.toLowerCase())) return true;
      // Keyword match
      return keywords.some((kw) => vStr.includes(kw));
    });
  },

  reserveVehicle(input: ReserveVehicleInput): VehicleStock {
    const vehicle = inventoryStore.find((v) => v.id === input.vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${input.vehicleId} not found in inventory.`);
    }

    if (vehicle.status === 'reserved') {
      throw new Error(
        `Unit ${vehicle.vin} is already on hold for ${vehicle.allocatedCustomerName || 'another customer'}. Double-booking is strictly prohibited.`
      );
    }

    if (vehicle.status === 'released') {
      throw new Error(`Unit ${vehicle.vin} has already been sold and released.`);
    }

    const duration = input.durationHours || 48;
    const expiresAt = new Date(Date.now() + duration * 3600 * 1000).toISOString();

    vehicle.status = 'reserved';
    vehicle.allocatedLeadId = input.leadId;
    vehicle.allocatedCustomerName = input.customerName.trim();
    vehicle.allocatedAgentId = input.agentId;
    vehicle.allocatedAgentName = input.agentName.trim();
    vehicle.reservationDeposit = input.depositAmount !== undefined ? input.depositAmount : 20_000;
    vehicle.reservationExpiresAt = expiresAt;
    vehicle.updatedAt = new Date().toISOString();

    return { ...vehicle };
  },

  releaseHold(vehicleId: string, _reason?: string): VehicleStock {
    const vehicle = inventoryStore.find((v) => v.id === vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${vehicleId} not found in inventory.`);
    }

    if (vehicle.status !== 'reserved') {
      throw new Error(`Unit ${vehicle.vin} is not currently on reservation hold.`);
    }

    vehicle.status = 'in_stock';
    vehicle.allocatedLeadId = undefined;
    vehicle.allocatedCustomerName = undefined;
    vehicle.allocatedAgentId = undefined;
    vehicle.allocatedAgentName = undefined;
    vehicle.reservationDeposit = undefined;
    vehicle.reservationExpiresAt = undefined;
    vehicle.updatedAt = new Date().toISOString();

    return { ...vehicle };
  },

  markAsSoldAndReleased(vehicleId: string): VehicleStock {
    const vehicle = inventoryStore.find((v) => v.id === vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle with ID ${vehicleId} not found.`);
    }

    vehicle.status = 'released';
    vehicle.updatedAt = new Date().toISOString();
    return { ...vehicle };
  },

  checkExpiredHolds(): number {
    const now = new Date().toISOString();
    let expiredCount = 0;

    inventoryStore.forEach((v) => {
      if (v.status === 'reserved' && v.reservationExpiresAt && v.reservationExpiresAt < now) {
        v.status = 'in_stock';
        v.allocatedLeadId = undefined;
        v.allocatedCustomerName = undefined;
        v.allocatedAgentId = undefined;
        v.allocatedAgentName = undefined;
        v.reservationDeposit = undefined;
        v.reservationExpiresAt = undefined;
        v.updatedAt = now;
        expiredCount++;
      }
    });

    return expiredCount;
  },

  calculateInventoryKpis(): InventoryKpiSummary {
    const totalUnits = inventoryStore.length;
    const inStockCount = inventoryStore.filter((v) => v.status === 'in_stock').length;
    const reservedCount = inventoryStore.filter((v) => v.status === 'reserved').length;
    const inTransitCount = inventoryStore.filter((v) => v.status === 'in_transit').length;
    const agedUnitsCount = inventoryStore.filter(
      (v) => v.daysInStock > 60 && v.status === 'in_stock'
    ).length;
    const totalInventoryValue = inventoryStore.reduce((acc, v) => acc + v.msrp, 0);

    return {
      totalUnits,
      inStockCount,
      reservedCount,
      inTransitCount,
      agedUnitsCount,
      totalInventoryValue,
    };
  },

  resetMockStore(): void {
    inventoryStore = JSON.parse(JSON.stringify(SEED_INVENTORY));
  },
};
