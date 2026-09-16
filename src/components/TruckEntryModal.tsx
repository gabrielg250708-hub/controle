import { useState, useEffect, type FormEvent } from 'react';
import { 
  X, 
  Truck as TruckIcon, 
  Building2, 
  ParkingSquare, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Dock, ParkingSpace, CargoType, OperationType, Truck } from '../types';

interface TruckEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  docks: Dock[];
  parkingSpaces: ParkingSpace[];
  preSelectedDockId?: string | null;
  preSelectedSpaceId?: string | null;
  activeTrucksCount: number;
  maxCapacity: number;
  onSubmit: (truckData: Omit<Truck, 'id'>) => void;
}

const CARGO_OPTIONS: CargoType[] = [
  'Carga Geral',
  'Alimentos e Perecíveis',
  'Refrigerada / Congelada',
  'Eletrônicos e Alto Valor',
  'Químicos e Perigosos',
  'Granel',
  'Farmacêutica',
];

export function TruckEntryModal({
  isOpen,
  onClose,
  docks,
  parkingSpaces,
  preSelectedDockId,
  preSelectedSpaceId,
  activeTrucksCount,
  maxCapacity,
  onSubmit,
}: TruckEntryModalProps) {
  const [plate, setPlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [carrier, setCarrier] = useState('');
  const [cargoType, setCargoType] = useState<CargoType>('Carga Geral');
  const [operationType, setOperationType] = useState<OperationType>('DESCARGA');
  const [destinationType, setDestinationType] = useState<'DOCK' | 'PARKING' | 'QUEUE'>('DOCK');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(75);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const freeDocks = docks.filter((d) => !d.isOccupied);
  const freeParking = parkingSpaces.filter((p) => !p.isOccupied);

  // Auto-fill or adjust when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (preSelectedDockId) {
        setDestinationType('DOCK');
        setSelectedLocationId(preSelectedDockId);
      } else if (preSelectedSpaceId) {
        setDestinationType('PARKING');
        setSelectedLocationId(preSelectedSpaceId);
      } else {
        // Default to first free dock if available, else first free parking, else queue
        if (freeDocks.length > 0) {
          setDestinationType('DOCK');
          setSelectedLocationId(freeDocks[0].id);
        } else if (freeParking.length > 0) {
          setDestinationType('PARKING');
          setSelectedLocationId(freeParking[0].id);
        } else {
          setDestinationType('QUEUE');
          setSelectedLocationId('');
        }
      }
    }
  }, [isOpen, preSelectedDockId, preSelectedSpaceId]);

  if (!isOpen) return null;

  const handlePlateChange = (val: string) => {
    // Keep uppercase alphanumeric and dashes
    const clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 8);
    setPlate(clean);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!plate.trim() || plate.trim().length < 5) {
      setErrorMsg('Por favor, informe uma placa válida (mínimo 5 caracteres).');
      return;
    }

    if (!driverName.trim()) {
      setErrorMsg('Por favor, informe o nome do motorista.');
      return;
    }

    if (activeTrucksCount >= maxCapacity) {
      setErrorMsg(`Capacidade máxima do CD atingida (${maxCapacity} caminhões). Libere um caminhão antes de registrar nova entrada.`);
      return;
    }

    let status: 'DOCA' | 'PATIO' | 'FILA' = 'FILA';
    let locationId: string | null = null;
    let locationName = 'Fila de Espera (Portaria)';

    if (destinationType === 'DOCK') {
      if (!selectedLocationId) {
        setErrorMsg('Por favor, selecione uma doca livre para alocar o caminhão.');
        return;
      }
      const dock = docks.find((d) => d.id === selectedLocationId);
      if (dock?.isOccupied) {
        setErrorMsg('A doca selecionada já está ocupada. Escolha outra doca.');
        return;
      }
      status = 'DOCA';
      locationId = selectedLocationId;
      locationName = dock?.name || selectedLocationId;
    } else if (destinationType === 'PARKING') {
      if (!selectedLocationId) {
        setErrorMsg('Por favor, selecione uma vaga no pátio para estacionar o caminhão.');
        return;
      }
      const space = parkingSpaces.find((p) => p.id === selectedLocationId);
      if (space?.isOccupied) {
        setErrorMsg('A vaga de pátio selecionada já está ocupada.');
        return;
      }
      status = 'PATIO';
      locationId = selectedLocationId;
      locationName = space?.name || selectedLocationId;
    } else {
      status = 'FILA';
      locationId = null;
      locationName = 'Fila de Espera (Portaria)';
    }

    const now = new Date().toISOString();

    onSubmit({
      plate: plate.toUpperCase().trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim() || undefined,
      carrier: carrier.trim() || 'Autônomo / Direto',
      cargoType,
      operationType,
      status,
      locationId,
      locationName,
      entryTime: now,
      dockAssignedTime: status === 'DOCA' ? now : undefined,
      targetDurationMinutes,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setPlate('');
    setDriverName('');
    setDriverPhone('');
    setCarrier('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TruckIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Registrar Chegada de Caminhão
              </h3>
              <p className="text-xs text-slate-400">
                Entrada na portaria e destinação operacional imediata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Placa e Operação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Placa do Veículo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: ABC-1234 ou BRA2E19"
                  value={plate}
                  onChange={(e) => handlePlateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500">
                  BR
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Operação *
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['DESCARGA', 'CARGA', 'MISTA'] as OperationType[]).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperationType(op)}
                    className={`py-1.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                      operationType === op
                        ? op === 'DESCARGA'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : op === 'CARGA'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Motorista e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Motorista *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Antônio Carlos Silva"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 3: Transportadora e Tipo de Carga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Transportadora / Empresa
              </label>
              <input
                type="text"
                placeholder="Ex: TransLog, Rodoviário Sul..."
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Carga *
              </label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value as CargoType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              >
                {CARGO_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination Selector (Doca vs Patio vs Fila) */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-xs font-bold text-slate-200 mb-2">
              Alocação Inicial no Centro de Distribuição *
            </label>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setDestinationType('DOCK');
                  if (freeDocks.length > 0 && !selectedLocationId.startsWith('D-')) {
                    setSelectedLocationId(freeDocks[0].id);
                  }
                }}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  destinationType === 'DOCK'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Doca Direta</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {freeDocks.length} livres
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDestinationType('PARKING');
                  if (freeParking.length > 0 && !selectedLocationId.startsWith('P-')) {
                    setSelectedLocationId(freeParking[0].id);
                  }
                }}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  destinationType === 'PARKING'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ParkingSquare className="w-3.5 h-3.5" />
                  <span>Pátio Interno</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {freeParking.length} vagas livres
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDestinationType('QUEUE');
                  setSelectedLocationId('');
                }}
                className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                  destinationType === 'QUEUE'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Fila de Espera</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Portaria / Triagem
                </div>
              </button>
            </div>

            {/* Sub-selector based on destination */}
            {destinationType === 'DOCK' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Selecione a Doca Livre:
                </label>
                {freeDocks.length === 0 ? (
                  <p className="text-xs text-rose-400 p-2 bg-rose-950/20 rounded border border-rose-500/30">
                    Todas as 14 docas estão ocupadas no momento! Selecione uma vaga no Pátio ou Fila de Espera.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-36 overflow-y-auto p-1">
                    {freeDocks.map((dock) => (
                      <button
                        key={dock.id}
                        type="button"
                        onClick={() => setSelectedLocationId(dock.id)}
                        className={`p-1.5 rounded text-xs font-mono font-bold border transition-colors cursor-pointer text-center ${
                          selectedLocationId === dock.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        {dock.name.replace('Doca ', 'D-')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {destinationType === 'PARKING' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Selecione a Vaga de Pátio Livre:
                </label>
                {freeParking.length === 0 ? (
                  <p className="text-xs text-rose-400 p-2 bg-rose-950/20 rounded border border-rose-500/30">
                    Todas as 8 vagas de pátio estão ocupadas! Selecione Fila de Espera.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {freeParking.map((space) => (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => setSelectedLocationId(space.id)}
                        className={`p-2 rounded text-xs font-mono font-bold border transition-colors cursor-pointer text-center ${
                          selectedLocationId === space.id
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        {space.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {destinationType === 'QUEUE' && (
              <p className="text-xs text-slate-400">
                O caminhão será registrado na portaria com horário de chegada e ficará aguardando chamada para doca ou vaga no pátio.
              </p>
            )}
          </div>

          {/* Row 4: Target duration & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tempo Alvo Previsto
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={15}
                  max={300}
                  step={15}
                  value={targetDurationMinutes}
                  onChange={(e) => setTargetDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-400">min</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notas / NF / Lacres (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: NF #90210, 24 paletes refrigerados"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-truck-entry"
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmar Chegada</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
