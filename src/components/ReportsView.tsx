import { 
  BarChart3, 
  Clock, 
  Building2, 
  ParkingSquare, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Dock, ParkingSpace, Truck, MovementHistoryItem } from '../types';
import { formatDuration } from '../utils/formatters';

interface ReportsViewProps {
  docks: Dock[];
  parkingSpaces: ParkingSpace[];
  activeTrucks: Truck[];
  history: MovementHistoryItem[];
}

export function ReportsView({ docks, parkingSpaces, activeTrucks, history }: ReportsViewProps) {
  // Current dock occupancy
  const occupiedDocksCount = docks.filter((d) => d.isOccupied).length;
  const currentDockRate = Math.round((occupiedDocksCount / docks.length) * 100);

  // Current parking occupancy
  const occupiedParkingCount = parkingSpaces.filter((p) => p.isOccupied).length;
  const currentParkingRate = Math.round((occupiedParkingCount / parkingSpaces.length) * 100);

  // Historical completed exits
  const completedExits = history.filter((h) => h.actionType === 'SAIDA' && h.durationMinutes && h.durationMinutes > 0);
  
  const avgDockStayMinutes = completedExits.length > 0
    ? Math.round(completedExits.reduce((acc, h) => acc + (h.durationMinutes || 0), 0) / completedExits.length)
    : 70;

  // Max and Min duration
  const durations = completedExits.map((h) => h.durationMinutes || 0);
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  // Operation type distribution
  const totalOperations = history.length;
  const dischargesCount = history.filter((h) => h.operationType === 'DESCARGA').length;
  const chargesCount = history.filter((h) => h.operationType === 'CARGA').length;
  const mixedCount = history.filter((h) => h.operationType === 'MISTA').length;

  const dischargePct = totalOperations > 0 ? Math.round((dischargesCount / totalOperations) * 100) : 0;
  const chargePct = totalOperations > 0 ? Math.round((chargesCount / totalOperations) * 100) : 0;
  const mixedPct = totalOperations > 0 ? Math.round((mixedCount / totalOperations) * 100) : 0;

  // Cargo categories aggregation
  const cargoCounts: Record<string, number> = {};
  history.forEach((h) => {
    cargoCounts[h.cargoType] = (cargoCounts[h.cargoType] || 0) + 1;
  });

  const sortedCargos = Object.entries(cargoCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Relatório de Produtividade & Indicadores Logísticos
            </h2>
            <p className="text-xs text-slate-400">
              Métricas consolidadas de ocupação, tempos de permanência e volume de fluxo no centro de distribuição
            </p>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ocupação das Docas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ocupação Média de Docas</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-100">
              {currentDockRate}%
            </span>
            <span className="text-xs font-semibold text-slate-400">
              ({occupiedDocksCount} de 14 ativas)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${currentDockRate}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Capacidade nominal: 14 baías simultâneas
          </span>
        </div>

        {/* KPI 2: Ocupação do Pátio */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ocupação do Pátio</span>
            <ParkingSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-100">
              {currentParkingRate}%
            </span>
            <span className="text-xs font-semibold text-slate-400">
              ({occupiedParkingCount} de 8 vagas)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-sky-500 h-full rounded-full transition-all"
              style={{ width: `${currentParkingRate}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            {8 - occupiedParkingCount} vagas livres para estacionamento
          </span>
        </div>

        {/* KPI 3: Tempo Médio de Permanência */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tempo Médio em Doca</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-400">
              {formatDuration(avgDockStayMinutes)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>Mín: {formatDuration(minDuration)}</span>
            <span>Máx: {formatDuration(maxDuration)}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Meta operacional: ≤ 75 minutos
          </span>
        </div>

        {/* KPI 4: Volume Total de Movimentações */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume de Movimentações</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-100">
              {totalOperations}
            </span>
            <span className="text-xs text-slate-400">ações registradas</span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{completedExits.length} finalizadas</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{activeTrucks.length} em trânsito no CD</span>
          </div>
        </div>
      </div>

      {/* Analytical Breakdown: Operations and Cargo Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Operations Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Distribuição por Tipo de Operação</span>
            <span className="text-xs text-slate-400 font-normal">{totalOperations} total</span>
          </h3>

          <div className="space-y-3">
            {/* Descarga */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                  <ArrowDownRight className="w-3.5 h-3.5 text-blue-400" />
                  Descarga (Recebimento)
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {dischargesCount} ({dischargePct}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${dischargePct}%` }}
                />
              </div>
            </div>

            {/* Carga */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                  Carga (Expedição)
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {chargesCount} ({chargePct}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${chargePct}%` }}
                />
              </div>
            </div>

            {/* Mista */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Operação Mista (Descarga + Carga)
                </span>
                <span className="font-mono text-slate-200 font-bold">
                  {mixedCount} ({mixedPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${mixedPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed">
            💡 <strong>Insight Operacional:</strong> O fluxo do centro de distribuição apresenta equilíbrio entre operações de recebimento e expedição, permitindo giro contínuo das docas de 1 a 14.
          </div>
        </div>

        {/* Cargo Types Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Fluxo por Tipo de Carga</span>
            <span className="text-xs text-slate-400 font-normal">Categorias</span>
          </h3>

          <div className="space-y-2.5">
            {sortedCargos.map(([cargo, count]) => {
              const pct = totalOperations > 0 ? Math.round((count / totalOperations) * 100) : 0;
              return (
                <div key={cargo} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 truncate">{cargo}</span>
                    <span className="font-mono text-slate-400 font-semibold">
                      {count} {count === 1 ? 'veículo' : 'veículos'} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
            Docas com controle térmico (D-01, D-02, D-13, D-14) atendem prioritariamente Alimentos e Cargas Refrigeradas.
          </div>
        </div>
      </div>
    </div>
  );
}
