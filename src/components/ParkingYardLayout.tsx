import { 
  ParkingSquare, 
  Clock, 
  ArrowRight, 
  LogOut, 
  CheckCircle2, 
  User, 
  Truck as TruckIcon, 
  ArrowDownRight, 
  ArrowUpRight 
} from 'lucide-react';
import { ParkingSpace, Truck, Dock } from '../types';
import { formatDuration, getElapsedMinutes } from '../utils/formatters';

interface ParkingYardLayoutProps {
  parkingSpaces: ParkingSpace[];
  activeTrucks: Truck[];
  docks: Dock[];
  onOpenExitModal: (truck: Truck) => void;
  onOpenAllocateModal: (truck: Truck) => void;
  onSelectSpaceForEntry: (spaceId: string) => void;
  onOpenTruckDetails: (truck: Truck) => void;
}

export function ParkingYardLayout({
  parkingSpaces,
  activeTrucks,
  docks,
  onOpenExitModal,
  onOpenAllocateModal,
  onSelectSpaceForEntry,
  onOpenTruckDetails,
}: ParkingYardLayoutProps) {
  const occupiedCount = parkingSpaces.filter((p) => p.isOccupied).length;
  const freeDocksCount = docks.filter((d) => !d.isOccupied).length;

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ParkingSquare className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">
              Pátio de Estacionamento Interno (8 Vagas)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {occupiedCount}/8 vagas ocupadas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Área de pulmão operacional e triagem para caminhões aguardando autorização ou vaga em doca
          </p>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-400"></span>
          <span>{freeDocksCount} {freeDocksCount === 1 ? 'doca livre' : 'docas livres'} no momento</span>
        </div>
      </div>

      {/* Grid of 8 Parking Spaces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        {parkingSpaces.map((space) => {
          const truck = activeTrucks.find((t) => t.id === space.currentTruckId);
          const elapsed = truck ? getElapsedMinutes(truck.entryTime) : 0;

          return (
            <div
              key={space.id}
              id={`parking-space-${space.id}`}
              className={`rounded-lg border p-3 flex flex-col justify-between transition-all ${
                space.isOccupied
                  ? 'bg-slate-950 border-sky-500/40 shadow-sky-950/20'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header of Space */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {space.name}
                  </span>

                  {space.isOccupied ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      Estacionado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      Livre
                    </span>
                  )}
                </div>

                {/* Content */}
                {space.isOccupied && truck ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono font-bold text-xs text-sky-400">
                        {truck.plate}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          truck.operationType === 'DESCARGA'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-purple-500/10 text-purple-400'
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

                    <div className="text-[11px] text-slate-300 leading-tight space-y-0.5">
                      <div className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{truck.driverName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 truncate text-[10px]">
                        <TruckIcon className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{truck.carrier}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>No pátio:</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-200">
                        {formatDuration(elapsed)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center">
                    <p className="text-xs text-slate-500 mb-2">
                      Vaga disponível
                    </p>
                    <button
                      id={`btn-space-assign-${space.id}`}
                      onClick={() => onSelectSpaceForEntry(space.id)}
                      className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      + Alocar Veículo
                    </button>
                  </div>
                )}
              </div>

              {/* Actions if occupied */}
              {space.isOccupied && truck && (
                <div className="pt-2 mt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5">
                  <button
                    id={`btn-space-transfer-${space.id}`}
                    onClick={() => onOpenAllocateModal(truck)}
                    className="py-1 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Chamar para doca livre"
                  >
                    <span>Mover Doca</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    id={`btn-space-exit-${space.id}`}
                    onClick={() => onOpenExitModal(truck)}
                    className="py-1 px-2 bg-slate-900 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Registrar saída do veículo"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Saída</span>
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
