import { 
  Clock, 
  ArrowRight, 
  Building2, 
  ParkingSquare, 
  LogOut, 
  User, 
  Package, 
  AlertCircle,
  Truck as TruckIcon
} from 'lucide-react';
import { Truck, Dock, ParkingSpace } from '../types';
import { formatDuration, getElapsedMinutes, formatDateTime } from '../utils/formatters';

interface QueueViewProps {
  activeTrucks: Truck[];
  docks: Dock[];
  parkingSpaces: ParkingSpace[];
  onOpenAllocateModal: (truck: Truck) => void;
  onOpenExitModal: (truck: Truck) => void;
  onOpenEntryModal: () => void;
}

export function QueueView({
  activeTrucks,
  docks,
  parkingSpaces,
  onOpenAllocateModal,
  onOpenExitModal,
  onOpenEntryModal,
}: QueueViewProps) {
  const queueTrucks = activeTrucks.filter((t) => t.status === 'FILA');
  const freeDocks = docks.filter((d) => !d.isOccupied);
  const freeParking = parkingSpaces.filter((p) => !p.isOccupied);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">
                Fila de Espera Externa / Portaria
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {queueTrucks.length} {queueTrucks.length === 1 ? 'veículo' : 'veículos'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Caminhões que já deram entrada no sistema e aguardam liberação de vaga no pátio ou doca de operação
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-400 block">Disponibilidade Imediata:</span>
              <span className="font-mono font-bold text-emerald-400">
                {freeDocks.length} docas livres • {freeParking.length} vagas de pátio
              </span>
            </div>
            <button
              id="btn-queue-register-arrival"
              onClick={onOpenEntryModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              + Nova Entrada
            </button>
          </div>
        </div>
      </div>

      {/* Queue List */}
      {queueTrucks.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TruckIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            Nenhum caminhão na fila de espera
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Todas as chegadas foram alocadas imediatamente para as docas ou vagas do pátio interno. O fluxo está normalizado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {queueTrucks.map((truck, index) => {
            const waitingMinutes = getElapsedMinutes(truck.entryTime);
            const isLongWait = waitingMinutes > 45;

            return (
              <div
                key={truck.id}
                id={`queue-card-${truck.id}`}
                className={`bg-slate-900 border rounded-xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isLongWait ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                {/* Position & Info */}
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 font-mono font-black text-base text-amber-400 shrink-0">
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded bg-slate-950 text-slate-100 border border-slate-700 tracking-wider">
                        {truck.plate}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          truck.operationType === 'DESCARGA'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {truck.operationType}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {truck.cargoType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <strong className="text-slate-200">{truck.driverName}</strong>
                        {truck.driverPhone && <span className="text-slate-500">({truck.driverPhone})</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>{truck.carrier}</span>
                      </span>
                      <span className="text-slate-500">
                        Chegada às {formatDateTime(truck.entryTime)}
                      </span>
                    </div>

                    {truck.notes && (
                      <div className="mt-1.5 text-xs text-amber-300/80 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>{truck.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Waiting duration & Actions */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Elapsed Wait badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <Clock className={`w-4 h-4 ${isLongWait ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                    <div className="text-right leading-none">
                      <span className="text-[10px] text-slate-500 block">Tempo na Fila</span>
                      <span className={`font-mono text-xs font-bold ${isLongWait ? 'text-amber-400' : 'text-slate-200'}`}>
                        {formatDuration(waitingMinutes)}
                      </span>
                    </div>
                  </div>

                  {/* Move to Dock / Parking */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-queue-allocate-${truck.id}`}
                      onClick={() => onOpenAllocateModal(truck)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Alocar em Doca / Pátio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-queue-cancel-${truck.id}`}
                      onClick={() => onOpenExitModal(truck)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Registrar saída / Cancelar espera"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
