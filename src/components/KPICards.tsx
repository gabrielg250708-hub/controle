import { 
  Building2, 
  ParkingSquare, 
  Clock, 
  Timer, 
  ArrowLeftRight 
} from 'lucide-react';
import { Dock, ParkingSpace, Truck, MovementHistoryItem } from '../types';
import { formatDuration } from '../utils/formatters';

interface KPICardsProps {
  docks: Dock[];
  parkingSpaces: ParkingSpace[];
  activeTrucks: Truck[];
  history: MovementHistoryItem[];
  onSelectTab: (tab: 'overview' | 'queue' | 'history' | 'reports') => void;
}

export function KPICards({ docks, parkingSpaces, activeTrucks, history, onSelectTab }: KPICardsProps) {
  const occupiedDocks = docks.filter((d) => d.isOccupied).length;
  const totalDocks = docks.length;
  const dockOccupancyRate = Math.round((occupiedDocks / totalDocks) * 100);

  const occupiedParking = parkingSpaces.filter((p) => p.isOccupied).length;
  const totalParking = parkingSpaces.length;
  const parkingOccupancyRate = Math.round((occupiedParking / totalParking) * 100);

  const waitingTrucks = activeTrucks.filter((t) => t.status === 'FILA').length;

  // Calculate average dock duration from history
  const dockHistory = history.filter((h) => h.durationMinutes && h.durationMinutes > 0);
  const avgDurationMinutes = dockHistory.length > 0
    ? Math.round(dockHistory.reduce((acc, h) => acc + (h.durationMinutes || 0), 0) / dockHistory.length)
    : 65;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* 1. Docas */}
      <div 
        onClick={() => onSelectTab('overview')}
        className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-3.5 rounded-lg transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Docas (14)
          </span>
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {occupiedDocks}
            <span className="text-sm font-normal text-slate-500">/{totalDocks}</span>
          </span>
          <span className={`text-xs font-semibold ${dockOccupancyRate > 80 ? 'text-rose-400' : 'text-amber-400'}`}>
            {dockOccupancyRate}%
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>{totalDocks - occupiedDocks} livres</span>
          <span className="text-slate-500">Ocupação</span>
        </div>
      </div>

      {/* 2. Pátio */}
      <div 
        onClick={() => onSelectTab('overview')}
        className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 p-3.5 rounded-lg transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pátio (8 Vagas)
          </span>
          <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
            <ParkingSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {occupiedParking}
            <span className="text-sm font-normal text-slate-500">/{totalParking}</span>
          </span>
          <span className={`text-xs font-semibold ${parkingOccupancyRate > 75 ? 'text-amber-400' : 'text-sky-400'}`}>
            {parkingOccupancyRate}%
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>{totalParking - occupiedParking} livres</span>
          <span className="text-slate-500">Estacionamento</span>
        </div>
      </div>

      {/* 3. Fila de Espera */}
      <div 
        onClick={() => onSelectTab('queue')}
        className={`bg-slate-900/90 border p-3.5 rounded-lg transition-all cursor-pointer shadow-sm group ${
          waitingTrucks > 0 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Fila de Espera
          </span>
          <div className={`p-1.5 rounded-md ${waitingTrucks > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono ${waitingTrucks > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
            {waitingTrucks}
          </span>
          <span className="text-xs text-slate-400">caminhões</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {waitingTrucks > 0 ? (
            <span className="text-amber-400 font-medium">Aguardando vaga/doca</span>
          ) : (
            <span className="text-emerald-400 font-medium">Sem espera na portaria</span>
          )}
        </div>
      </div>

      {/* 4. Tempo Médio em Doca */}
      <div 
        onClick={() => onSelectTab('reports')}
        className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-3.5 rounded-lg transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tempo Médio Doca
          </span>
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <Timer className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {formatDuration(avgDurationMinutes)}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>Meta: &lt; 90 min</span>
          <span className="text-emerald-400 font-medium">No Alvo</span>
        </div>
      </div>

      {/* 5. Total de Movimentações */}
      <div 
        onClick={() => onSelectTab('history')}
        className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Movimentações
          </span>
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">
            {history.length}
          </span>
          <span className="text-xs text-slate-400">registradas</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span className="text-slate-400 font-mono">{activeTrucks.length} no CD agora</span>
          <span className="text-indigo-400 font-medium">Histórico &rarr;</span>
        </div>
      </div>
    </div>
  );
}
