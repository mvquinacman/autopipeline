import React, { useState, useMemo, useCallback } from 'react';
import type { VehicleStockStatus } from '../types/inventory';
import { inventoryService } from '../services/inventoryService';
import { formatPeso } from '../data/seed';
import {
  Car,
  Search,
  Lock,
  Unlock,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Boxes,
} from 'lucide-react';

export const InventoryMatrixView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<VehicleStockStatus | 'all' | 'aged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const kpis = useMemo(() => {
    // depend on refreshKey to recompute
    void refreshKey;
    return inventoryService.calculateInventoryKpis();
  }, [refreshKey]);

  const vehicles = useMemo(() => {
    void refreshKey;
    return inventoryService.getInventory({
      status: statusFilter,
      search: searchQuery,
    });
  }, [statusFilter, searchQuery, refreshKey]);

  const handleReleaseHold = useCallback((vehicleId: string, customerName?: string) => {
    if (
      window.confirm(
        `Are you sure you want to release the reservation hold for ${customerName || 'this customer'}? The unit will return to available stock.`
      )
    ) {
      try {
        inventoryService.releaseHold(vehicleId, 'Manual hold release by sales manager');
        setRefreshKey((k) => k + 1);
      } catch (err: any) {
        alert(err.message || 'Failed to release hold.');
      }
    }
  }, []);

  const getStatusBadge = (status: VehicleStockStatus) => {
    switch (status) {
      case 'in_stock':
        return (
          <span className="text-[10.5px] font-bold text-won bg-won/10 px-2.5 py-0.5 rounded-full border border-won/20 flex items-center gap-1">
            <CheckCircle2 className="size-3" /> AVAILABLE
          </span>
        );
      case 'reserved':
        return (
          <span className="text-[10.5px] font-bold text-due bg-due/10 px-2.5 py-0.5 rounded-full border border-due/20 flex items-center gap-1">
            <Lock className="size-3" /> 48-HR HOLD
          </span>
        );
      case 'in_transit':
        return (
          <span className="text-[10.5px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
            <Clock className="size-3" /> IN TRANSIT
          </span>
        );
      default:
        return (
          <span className="text-[10.5px] font-bold text-sub bg-sub/10 px-2.5 py-0.5 rounded-full border border-sub/20">
            RELEASED
          </span>
        );
    }
  };

  const formatHoursLeft = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Hold Expired';
    const hours = Math.floor(diffMs / (1000 * 3600));
    const mins = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));
    return `${hours}h ${mins}m left`;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="size-5 text-cobalt" />
            <h2 className="font-display text-2xl font-bold text-ink">Vehicle Stock Matrix</h2>
          </div>
          <p className="text-xs text-sub">
            Real-time physical stockyard inventory, pipeline allocations, and 48-hour reservation holds
          </p>
        </div>
      </div>

      {/* Spec-Sheet Inventory KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line rounded-card overflow-hidden">
        <div className="bg-card p-3 sm:p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            Total Inventory
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-ink tabular-nums leading-tight">
            {kpis.totalUnits}
          </p>
          <span className="text-[10px] text-sub">Showroom &amp; transit</span>
        </div>

        <div className="bg-card p-3 sm:p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            Available In-Stock
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-won tabular-nums leading-tight">
            {kpis.inStockCount}
          </p>
          <span className="text-[10px] text-sub">Ready for allocation</span>
        </div>

        <div className="bg-card p-3 sm:p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            48-Hr Holds
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-due tabular-nums leading-tight">
            {kpis.reservedCount}
          </p>
          <span className="text-[10px] text-sub">Reserved with deposits</span>
        </div>

        <div className="bg-card p-3 sm:p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            In Transit
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-teal-700 tabular-nums leading-tight">
            {kpis.inTransitCount}
          </p>
          <span className="text-[10px] text-sub">Port of Batangas</span>
        </div>

        <div className="bg-card p-3 sm:p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            Aged Stock (&gt;60d)
          </span>
          <p
            className={`font-display text-2xl sm:text-3xl font-bold tabular-nums leading-tight ${
              kpis.agedUnitsCount > 0 ? 'text-overdue' : 'text-ink'
            }`}
          >
            {kpis.agedUnitsCount}
          </p>
          <span className="text-[10px] text-sub">Management push units</span>
        </div>

        <div className="bg-card p-3 sm:p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            Total Asset Value
          </span>
          <p className="font-display text-xl sm:text-2xl font-bold text-ink tabular-nums leading-tight truncate">
            {formatPeso(kpis.totalInventoryValue, true)}
          </p>
          <span className="text-[10px] text-sub">At gross retail MSRP</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-cobalt text-white shadow-sm'
                : 'bg-paper text-sub hover:text-ink hover:bg-wash'
            }`}
          >
            All Units ({kpis.totalUnits})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_stock')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'in_stock'
                ? 'bg-cobalt text-white shadow-sm'
                : 'bg-paper text-sub hover:text-ink hover:bg-wash'
            }`}
          >
            In Stock ({kpis.inStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('reserved')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'reserved'
                ? 'bg-cobalt text-white shadow-sm'
                : 'bg-paper text-sub hover:text-ink hover:bg-wash'
            }`}
          >
            On Hold ({kpis.reservedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_transit')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold whitespace-nowrap transition-colors ${
              statusFilter === 'in_transit'
                ? 'bg-cobalt text-white shadow-sm'
                : 'bg-paper text-sub hover:text-ink hover:bg-wash'
            }`}
          >
            In Transit ({kpis.inTransitCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('aged')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
              statusFilter === 'aged'
                ? 'bg-overdue text-white shadow-sm'
                : 'bg-paper text-overdue hover:bg-overdue/10'
            }`}
          >
            <AlertTriangle className="size-3" /> Aged Stock ({kpis.agedUnitsCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="size-3.5 text-sub absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search VIN, model, color, lot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-control border border-line bg-card text-xs text-ink placeholder:text-sub focus:border-cobalt focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Vehicle Stock Cards Grid */}
      {vehicles.length === 0 ? (
        <div className="bg-card border border-line rounded-card p-12 text-center space-y-3">
          <Car className="size-10 text-sub mx-auto opacity-40" />
          <h3 className="font-display text-lg font-bold text-ink">No Vehicles Found</h3>
          <p className="text-xs text-sub max-w-sm mx-auto">
            No stockyard units match your filter or search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const isAged = v.daysInStock > 60;
            const timeLeft = formatHoursLeft(v.reservationExpiresAt);

            return (
              <div
                key={v.id}
                className={`bg-card border rounded-card p-4 flex flex-col justify-between gap-3 transition-all hover:border-cobalt/60 shadow-sm ${
                  v.status === 'reserved'
                    ? 'border-due/40'
                    : isAged
                    ? 'border-overdue/30'
                    : 'border-line'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-display text-base font-bold text-ink leading-tight">
                        {v.model}
                      </h4>
                      <p className="text-xs text-sub">{v.variant}</p>
                    </div>
                    {getStatusBadge(v.status)}
                  </div>

                  <div className="flex items-baseline justify-between gap-2 mt-2">
                    <span className="font-display text-xl font-bold text-ink tabular-nums">
                      {formatPeso(v.msrp)}
                    </span>
                    <span className="text-[10.5px] font-mono text-sub uppercase bg-wash px-1.5 py-0.5 rounded border border-line">
                      VIN: {v.vin}
                    </span>
                  </div>

                  {/* Spec Row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-line text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sub block">Exterior</span>
                      <span className="font-medium text-ink truncate block" title={v.color}>
                        {v.color}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sub block">Interior</span>
                      <span className="font-medium text-ink truncate block" title={v.interiorColor}>
                        {v.interiorColor}
                      </span>
                    </div>
                  </div>

                  {/* Lot Location & Aging Row */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-line text-[11px] text-sub">
                    <span className="flex items-center gap-1 truncate" title={v.lotLocation}>
                      <MapPin className="size-3 text-sub shrink-0" /> {v.lotLocation}
                    </span>
                    {v.status === 'in_stock' && (
                      <span
                        className={`font-semibold shrink-0 ${
                          isAged
                            ? 'text-overdue bg-overdue/10 px-1.5 py-0.5 rounded border border-overdue/20 font-bold'
                            : 'text-sub'
                        }`}
                      >
                        {v.daysInStock}d on lot {isAged && '• AGED'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reserved Unit Banner */}
                {v.status === 'reserved' && (
                  <div className="bg-due/10 border border-due/20 rounded-control p-2.5 text-xs space-y-1 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-due tracking-wider">
                        Active 48-Hour Reservation
                      </span>
                      {timeLeft && (
                        <span className="text-[10.5px] font-bold text-due flex items-center gap-1">
                          <Clock className="size-3" /> {timeLeft}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-ink">Client: {v.allocatedCustomerName}</p>
                    <div className="flex items-center justify-between text-[11px] text-sub">
                      <span>Consultant: {v.allocatedAgentName}</span>
                      <span className="font-semibold text-ink">
                        Deposit: {formatPeso(v.reservationDeposit || 20_000)}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleReleaseHold(v.id, v.allocatedCustomerName)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sub hover:text-overdue transition-colors"
                      >
                        <Unlock className="size-3" /> Release Hold
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
