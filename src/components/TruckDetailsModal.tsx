import { 
  X, 
  Truck as TruckIcon, 
  Clock, 
  Building2, 
  User, 
  Package, 
  Phone, 
  FileText, 
  LogOut, 
  ArrowRight 
} from 'lucide-react';
import { Truck } from '../types';
import { formatDuration, getElapsedMinutes, formatDateTime } from '../utils/formatters';

interface TruckDetailsModalProps {
  truck: Truck | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenExit: (truck: Truck) => void;
  onOpenAllocate: (truck: Truck) => void;
}

export function TruckDetailsModal({
  truck,
  isOpen,
  onClose,
  onOpenExit,
  onOpenAllocate,
}: TruckDetailsModalProps) {
  if (!isOpen || !truck) return null;

  const totalMinutes = getElapsedMinutes(truck.entryTime);
  const dockMinutes = truck.dockAssignedTime ? getElapsedMinutes(truck.dockAssignedTime) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TruckIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-slate-100">
                  {truck.plate}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {truck.operationType}
                </span>
              </div>
              <p className="text-xs text-slate-400">Ficha Operacional do Veículo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Status & Location Banner */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Posição Atual:</span>
                <strong className="text-xs text-slate-100">{truck.locationName || truck.status}</strong>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Status:</span>
              <span className="text-xs font-bold text-amber-400">{truck.status}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 flex items-center gap-1 text-[11px] mb-1">
                <User className="w-3.5 h-3.5" /> Motorista
              </span>
              <span className="font-semibold text-slate-200 block">{truck.driverName}</span>
              {truck.driverPhone && (
                <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {truck.driverPhone}
                </span>
              )}
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 flex items-center gap-1 text-[11px] mb-1">
                <Package className="w-3.5 h-3.5" /> Transportadora
              </span>
              <span className="font-semibold text-slate-200 block">{truck.carrier}</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">{truck.cargoType}</span>
            </div>
          </div>

          {/* Time Statistics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 flex items-center gap-1 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5" /> Chegada / Entrada
              </span>
              <span className="font-mono text-slate-200 block">{formatDateTime(truck.entryTime)}</span>
              <span className="text-slate-400 text-[11px]">Total: {formatDuration(totalMinutes)}</span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 flex items-center gap-1 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5" /> Tempo na Doca
              </span>
              <span className="font-mono text-amber-400 font-bold block">
                {truck.status === 'DOCA' ? formatDuration(dockMinutes) : 'Não atracado'}
              </span>
              <span className="text-slate-400 text-[11px]">Alvo: {truck.targetDurationMinutes || 75}m</span>
            </div>
          </div>

          {/* Notes */}
          {truck.notes && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-500 flex items-center gap-1 text-[11px] mb-1">
                <FileText className="w-3.5 h-3.5" /> Observações e Notas Fiscais
              </span>
              <p className="text-slate-200 leading-relaxed">{truck.notes}</p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAllocate(truck);
              }}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Transferir Posição</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExit(truck);
              }}
              className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Registrar Saída</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
