import { describe, it, expect, beforeEach } from 'vitest';
import { inventoryService } from './inventoryService';

describe('inventoryService - Vehicle Stock & Reservation Holds', () => {
  beforeEach(() => {
    inventoryService.resetMockStore();
  });

  it('1. Retrieves full inventory and calculates stock KPIs correctly', () => {
    const allUnits = inventoryService.getInventory();
    expect(allUnits.length).toBe(10);

    const kpis = inventoryService.calculateInventoryKpis();
    expect(kpis.totalUnits).toBe(10);
    expect(kpis.inStockCount).toBe(6);
    expect(kpis.reservedCount).toBe(2);
    expect(kpis.inTransitCount).toBe(2);
    expect(kpis.agedUnitsCount).toBe(1); // vin-005 Vios 68 days
    expect(kpis.totalInventoryValue).toBeGreaterThan(20_000_000);
  });

  it('2. Filters inventory by status, model, aged stock, and VIN search', () => {
    // Status filter
    const inTransit = inventoryService.getInventory({ status: 'in_transit' });
    expect(inTransit.length).toBe(2);

    // Aged stock filter (> 60 days on lot)
    const aged = inventoryService.getInventory({ status: 'aged' });
    expect(aged.length).toBe(1);
    expect(aged[0].model).toBe('Vios 1.5 G');
    expect(aged[0].daysInStock).toBe(68);

    // Search by VIN substring
    const byVin = inventoryService.getInventory({ search: 'MR0BA3CD4P1000001' });
    expect(byVin.length).toBe(1);
    expect(byVin[0].color).toBe('Platinum White Pearl');
  });

  it('3. Finds available units matching prospect model interest', () => {
    const fortuners = inventoryService.getAvailableUnitsForModel('Toyota Fortuner 2.8 LTD');
    expect(fortuners.length).toBeGreaterThanOrEqual(2);
    expect(fortuners.every((u) => u.status === 'in_stock' || u.status === 'in_transit')).toBe(true);

    const pradoUnits = inventoryService.getAvailableUnitsForModel('Land Cruiser Prado 250');
    expect(pradoUnits.length).toBe(1);
    expect(pradoUnits[0].vin).toBe('JTEBU5JR4P2000003');
  });

  it('4. Places a 48-hour reservation hold and prevents double-booking', () => {
    const availableUnit = inventoryService.getVehicleById('vin-001')!;
    expect(availableUnit.status).toBe('in_stock');

    // Place hold
    const reserved = inventoryService.reserveVehicle({
      vehicleId: 'vin-001',
      leadId: 'lead-01',
      customerName: 'Maria Santos',
      agentId: 'user-agent-1',
      agentName: 'Paolo Morales',
      depositAmount: 20_000,
      durationHours: 48,
    });

    expect(reserved.status).toBe('reserved');
    expect(reserved.allocatedLeadId).toBe('lead-01');
    expect(reserved.allocatedCustomerName).toBe('Maria Santos');
    expect(reserved.reservationDeposit).toBe(20_000);
    expect(reserved.reservationExpiresAt).toBeDefined();

    // Verify expiration is roughly 48 hours in future
    const expTime = new Date(reserved.reservationExpiresAt!).getTime();
    const nowTime = Date.now();
    const diffHours = (expTime - nowTime) / (1000 * 3600);
    expect(diffHours).toBeGreaterThan(47.9);
    expect(diffHours).toBeLessThanOrEqual(48.1);

    // Attempt double-booking should throw
    expect(() =>
      inventoryService.reserveVehicle({
        vehicleId: 'vin-001',
        leadId: 'lead-02',
        customerName: 'Juan Dela Cruz',
        agentId: 'user-agent-2',
        agentName: 'Camille Dizon',
      })
    ).toThrowError(/Double-booking is strictly prohibited/i);
  });

  it('5. Releases reservation hold back to available stock', () => {
    // vin-007 is initially reserved for Roberto Lim
    const reservedUnit = inventoryService.getVehicleById('vin-007')!;
    expect(reservedUnit.status).toBe('reserved');

    const released = inventoryService.releaseHold('vin-007', 'Customer opted for Prado instead');
    expect(released.status).toBe('in_stock');
    expect(released.allocatedLeadId).toBeUndefined();
    expect(released.allocatedCustomerName).toBeUndefined();
    expect(released.reservationDeposit).toBeUndefined();

    // Now it can be reserved by another client
    const reReserved = inventoryService.reserveVehicle({
      vehicleId: 'vin-007',
      leadId: 'lead-09',
      customerName: 'Leah Bautista',
      agentId: 'user-agent-1',
      agentName: 'Paolo Morales',
    });
    expect(reReserved.status).toBe('reserved');
    expect(reReserved.allocatedCustomerName).toBe('Leah Bautista');
  });
});
