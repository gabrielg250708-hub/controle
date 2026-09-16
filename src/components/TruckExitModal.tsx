import { useState } from 'react';
import { 
  X, 
  LogOut, 
  Clock, 
  Building2, 
  User, 
  Package, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Truck } from '../types';
import { formatDuration, getElapsedMinutes, formatDateTime } from '../utils/formatters';

interface TruckExitModalProps {
  truck: Truck | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: (truck: Truck, exitNotes: string) => void;
}

export function TruckExitModal({ truck, isOpen, onClose, onConfirmExit }: TruckExitModalProps) {
  const [exitNotes, setExitNotes] = useState('');
  const [inspectionOk, setInspectionOk] = useState(true);

  if (!isOpen || !truck) return null;

  const totalMinutes = getElapsedMinutes(truck.entryTime);
  const dockMinutes = truck.dockAssignedTime ? getElapsedMinutes(truck.dockAssignedTime) : 0;

  const handleConfirm = () => {
    const finalNotes = exitNotes.trim()
      ? `${exitNotes} ${inspectionOk ? '(Conferência OK)' : ''}`
      : inspectionOk
      ? 'Operação concluída sem divergências.'
      : 'Saída registrada.';
    onConfirmExit(truck, finalNotes);
    setExitNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Registrar Saída de Caminhão
              </h3>
              <p className="text-xs text-slate-400">
                Liberação da doca/vaga e arquivamento no histórico
              </p>
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
          {/* Truck Card summary */}
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 tracking-wider">
                {truck.plate}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {truck.operationType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{truck.driverName}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate text-slate-400">
                <Package className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{truck.carrier}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Local:</span>
                <strong className="text-slate-200">{truck.locationName || truck.status}</strong>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Entrada: {formatDateTime(truck.entryTime)}</span>
              </div>
            </div>
          </div>

          {/* Times Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Tempo Total no CD</span>
              <span className="font-mono font-bold text-lg text-slate-100">
                {formatDuration(totalMinutes)}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
              <span className="text-[11px] text-slate-400 block mb-1">
                {truck.status === 'DOCA' ? 'Tempo na Doca' : 'Tempo Estacionado'}
              </span>
              <span className="font-mono font-bold text-lg text-amber-400">
                {formatDuration(truck.status === 'DOCA' ? dockMinutes : totalMinutes)}
              </span>
            </div>
          </div>

          {/* Inspection Check */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="inspection-check"
              checked={inspectionOk}
              onChange={(e) => setInspectionOk(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="inspection-check" className="text-xs text-slate-300 font-medium cursor-pointer">
              Conferência física, liberação de NF e lacres validados na portaria
            </label>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações da Saída / Despacho
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Descarga finalizada sem avarias. Lacre conferido pelo conferente João."
              value={exitNotes}
              onChange={(e) => setExitNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Notice */}
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Ao confirmar a saída, {truck.locationName || 'a posição'} será imediatamente liberada para o próximo veículo.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-truck-exit"
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Confirmar Saída e Liberar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
