import { useState } from 'react';
import { 
  X, 
  Building2, 
  ArrowRight, 
  ParkingSquare, 
  Clock, 
  Thermometer, 
  ShieldCheck 
} from 'lucide-react';
import { Truck, Dock, ParkingSpace } from '../types';

interface AllocateModalProps {
  truck: Truck | null;
  isOpen: boolean;
  onClose: () => void;
  docks: Dock[];
  parkingSpaces: ParkingSpace[];
  onConfirmAllocation: (
    truck: Truck,
    targetType: 'DOCK' | 'PARKING',
    targetId: string,
    targetName: string
  ) => void;
}

export function AllocateModal({
  truck,
  isOpen,
  onClose,
  docks,
  parkingSpaces,
  onConfirmAllocation,
}: AllocateModalProps) {
  const [targetType, setTargetType] = useState<'DOCK' | 'PARKING'>('DOCK');
  const [selectedId, setSelectedId] = useState<string>('');

  if (!isOpen || !truck) return null;

  const freeDocks = docks.filter((d) => !d.isOccupied);
  const freeParking = parkingSpaces.filter((p) => !p.isOccupied);

  const handleConfirm = () => {
    if (!selectedId) return;

    if (targetType === 'DOCK') {
      const dock = docks.find((d) => d.id === selectedId);
      if (dock) {
        onConfirmAllocation(truck, 'DOCK', dock.id, dock.name);
      }
    } else {
      const space = parkingSpaces.find((p) => p.id === selectedId);
      if (space) {
        onConfirmAllocation(truck, 'PARKING', space.id, space.name);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Alocar / Transferir Veículo
              </h3>
              <p className="text-xs text-slate-400">
                Mover caminhão para doca livre ou vaga de pátio
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
          {/* Current Truck Status Card */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono font-bold text-amber-400 text-sm">
                {truck.plate}
              </span>
              <span className="text-slate-300 font-semibold">
                {truck.driverName}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Carga: {truck.cargoType} ({truck.operationType})</span>
              <span>Origem atual: <strong className="text-slate-200">{truck.locationName || 'Fila'}</strong></span>
            </div>
          </div>

          {/* Type Selector (Doca vs Patio) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTargetType('DOCK');
                setSelectedId(freeDocks[0]?.id || '');
              }}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                targetType === 'DOCK'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Building2 className="w-4 h-4" />
                <span>Para Doca Livre</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {freeDocks.length} disponíveis
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetType('PARKING');
                setSelectedId(freeParking[0]?.id || '');
              }}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                targetType === 'PARKING'
                  ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                  : 'border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <ParkingSquare className="w-4 h-4" />
                <span>Para Vaga de Pátio</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {freeParking.length} disponíveis
              </span>
            </button>
          </div>

          {/* Location Choice */}
          {targetType === 'DOCK' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Selecione a Doca de Destino:
              </label>
              {freeDocks.length === 0 ? (
                <p className="text-xs text-rose-400 p-3 bg-rose-950/20 rounded border border-rose-500/30">
                  Nenhuma doca livre no momento. É necessário aguardar a saída de uma doca ou manter no pátio/fila.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-40 overflow-y-auto p-1">
                  {freeDocks.map((dock) => (
                    <button
                      key={dock.id}
                      type="button"
                      onClick={() => setSelectedId(dock.id)}
                      className={`p-2 rounded text-xs font-mono font-bold border transition-colors cursor-pointer text-center relative ${
                        selectedId === dock.id
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      {dock.name.replace('Doca ', 'D-')}
                      {dock.temperatureControlled && (
                        <Thermometer className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-sky-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Selecione a Vaga no Pátio:
              </label>
              {freeParking.length === 0 ? (
                <p className="text-xs text-rose-400 p-3 bg-rose-950/20 rounded border border-rose-500/30">
                  Nenhuma vaga de pátio livre no momento.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {freeParking.map((space) => (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => setSelectedId(space.id)}
                      className={`p-2 rounded text-xs font-mono font-bold border transition-colors cursor-pointer text-center ${
                        selectedId === space.id
                          ? 'bg-sky-500 text-slate-950 border-sky-400'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      {space.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-allocation"
              type="button"
              disabled={!selectedId}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmar Alocação</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
