import { useState } from 'react';
import { 
  Building2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  LogOut, 
  Thermometer, 
  Search,
  User,
  Package,
  AlertCircle
} from 'lucide-react';
import { Dock, Truck } from '../types';
import { formatDuration, getElapsedMinutes } from '../utils/formatters';

interface DockLayoutProps {
  docks: Dock[];
  activeTrucks: Truck[];
  onOpenExitModal: (truck: Truck) => void;
  onSelectDockForEntry: (dockId: string) => void;
  onOpenTruckDetails: (truck: Truck) => void;
}

export function DockLayout({
  docks,
  activeTrucks,
  onOpenExitModal,
  onSelectDockForEntry,
  onOpenTruckDetails,
}: DockLayoutProps) {
  const [filter, setFilter] = useState<'ALL' | 'OCCUPIED' | 'FREE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocks = docks.filter((dock) => {
    const truck = activeTrucks.find((t) => t.id === dock.currentTruckId);
    if (filter === 'OCCUPIED' && !dock.isOccupied) return false;
    if (filter === 'FREE' && dock.isOccupied) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = dock.name.toLowerCase().includes(query);
      const matchPlate = truck?.plate.toLowerCase().includes(query);
      const matchDriver = truck?.driverName.toLowerCase().includes(query);
      const matchCarrier = truck?.carrier.toLowerCase().includes(query);
      return matchName || matchPlate || matchDriver || matchCarrier;
    }
    return true;
  });

  const occupiedCount = docks.filter((d) => d.isOccupied).length;

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
      {/* Section Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">
              Docas de Carga e Descarga (14 Docas)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {occupiedCount}/14 em operação
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoramento em tempo real do status das baias, tempo de permanência e liberação
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar placa, doca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-md border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                filter === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({docks.length})
            </button>
            <button
              onClick={() => setFilter('OCCUPIED')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                filter === 'OCCUPIED' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ocupadas ({occupiedCount})
            </button>
            <button
              onClick={() => setFilter('FREE')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                filter === 'FREE' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Livres ({docks.length - occupiedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 14 Docks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {filteredDocks.map((dock) => {
          const truck = activeTrucks.find((t) => t.id === dock.currentTruckId);
          const elapsed = truck ? getElapsedMinutes(truck.dockAssignedTime || truck.entryTime) : 0;
          const target = truck?.targetDurationMinutes || 75;
          const progress = Math.min(100, Math.round((elapsed / target) * 100));
          const isOverdue = elapsed > target;

          return (
            <div
              key={dock.id}
              id={`dock-card-${dock.id}`}
              className={`flex flex-col justify-between rounded-lg border transition-all p-3 min-h-[170px] ${
                dock.isOccupied
                  ? isOverdue
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30'
                    : 'bg-slate-950 border-amber-500/40 shadow-amber-950/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              {/* Card Top: Dock Number + Type + Status Indicator */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm text-slate-200">
                      {dock.name}
                    </span>
                    {dock.temperatureControlled && (
                      <span title="Doca Refrigerada" className="text-sky-400">
                        <Thermometer className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {dock.isOccupied ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      Ocupada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Livre
                    </span>
                  )}
                </div>

                {/* Content Body */}
                {dock.isOccupied && truck ? (
                  <div className="space-y-2">
                    {/* Plate Display */}
                    <div className="flex items-center justify-between">
                      <div className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-xs text-amber-400 tracking-wider">
                        {truck.plate}
                      </div>

                      {/* Operation Type Badge */}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          truck.operationType === 'DESCARGA'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : truck.operationType === 'CARGA'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {truck.operationType === 'DESCARGA' ? (
                          <ArrowDownRight className="w-2.5 h-2.5" />
                        ) : (
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        )}
                        {truck.operationType}
                      </span>
                    </div>

                    {/* Driver & Carrier info */}
                    <div className="text-[11px] text-slate-300 leading-tight space-y-0.5">
                      <div className="flex items-center gap-1 truncate" title={truck.driverName}>
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{truck.driverName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 truncate text-[10px]">
                        <Package className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{truck.carrier}</span>
                      </div>
                    </div>

                    {/* Elapsed Time & Progress */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="font-mono">{formatDuration(elapsed)}</span>
                        </span>
                        <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400 font-mono'}>
                          Alvo: {target}m
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isOverdue
                              ? 'bg-rose-500'
                              : progress > 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Free Dock State */
                  <div className="py-4 text-center">
                    <p className="text-xs text-slate-500 mb-3">
                      Pronta para atracamento
                    </p>
                    <button
                      id={`btn-dock-assign-${dock.id}`}
                      onClick={() => onSelectDockForEntry(dock.id)}
                      className="w-full py-1.5 px-2 bg-slate-900 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 border border-slate-800 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + Alocar Caminhão
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Action for Occupied Dock */}
              {dock.isOccupied && truck && (
                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                  <button
                    id={`btn-dock-exit-${dock.id}`}
                    onClick={() => onOpenExitModal(truck)}
                    className="flex-1 py-1 px-2 bg-slate-900 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Registrar saída do caminhão e liberar doca"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Liberar Doca</span>
                  </button>

                  <button
                    id={`btn-dock-details-${dock.id}`}
                    onClick={() => onOpenTruckDetails(truck)}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded text-xs transition-colors cursor-pointer"
                    title="Ver detalhes da carga"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
