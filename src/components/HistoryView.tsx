import { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  ArrowDownRight, 
  ArrowUpRight, 
  LogOut, 
  PlusCircle, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { MovementHistoryItem, ActionType } from '../types';
import { formatDateTime, formatDuration, exportToCSV } from '../utils/formatters';

interface HistoryViewProps {
  history: MovementHistoryItem[];
}

export function HistoryView({ history }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | ActionType>('ALL');
  const [operationFilter, setOperationFilter] = useState<'ALL' | 'DESCARGA' | 'CARGA' | 'MISTA'>('ALL');

  const filteredHistory = history.filter((item) => {
    if (actionFilter !== 'ALL' && item.actionType !== actionFilter) return false;
    if (operationFilter !== 'ALL' && item.operationType !== operationFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchPlate = item.plate.toLowerCase().includes(q);
      const matchDriver = item.driverName.toLowerCase().includes(q);
      const matchCarrier = item.carrier.toLowerCase().includes(q);
      const matchLoc = (item.fromLocation || '').toLowerCase().includes(q) || (item.toLocation || '').toLowerCase().includes(q);
      return matchPlate || matchDriver || matchCarrier || matchLoc;
    }
    return true;
  });

  const handleExportCSV = () => {
    const data = filteredHistory.map((h) => ({
      ID: h.id,
      Data_Hora: formatDateTime(h.timestamp),
      Placa: h.plate,
      Motorista: h.driverName,
      Transportadora: h.carrier,
      Carga: h.cargoType,
      Operacao: h.operationType,
      Acao: h.actionType,
      Origem: h.fromLocation || '-',
      Destino: h.toLocation || '-',
      Duracao_Minutos: h.durationMinutes || 0,
      Observacoes: h.notes || '',
    }));
    exportToCSV(`historico-movimentacoes-cd-${new Date().toISOString().slice(0, 10)}`, data);
  };

  const getActionBadge = (action: ActionType) => {
    switch (action) {
      case 'ENTRADA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PlusCircle className="w-3 h-3" /> Entrada
          </span>
        );
      case 'SAIDA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <LogOut className="w-3 h-3" /> Saída
          </span>
        );
      case 'ALOCACAO_DOCA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ArrowRight className="w-3 h-3" /> Alocação Doca
          </span>
        );
      case 'ALOCACAO_PATIO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <ArrowRight className="w-3 h-3" /> Pátio
          </span>
        );
      case 'TRANSFERENCIA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ArrowRight className="w-3 h-3" /> Transferência
          </span>
        );
      default:
        return <span>{action}</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Histórico Geral de Movimentações
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {filteredHistory.length} registros
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditoria completa de entradas, alocações de docas, durações de estadia e saídas registradas
          </p>
        </div>

        {/* Export Button */}
        <button
          id="btn-export-history-csv"
          onClick={handleExportCSV}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa, motorista, transportadora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 font-medium">Ação:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="ENTRADA">Entradas</option>
            <option value="SAIDA">Saídas Concluídas</option>
            <option value="ALOCACAO_DOCA">Alocações em Doca</option>
            <option value="ALOCACAO_PATIO">Alocações em Pátio</option>
            <option value="TRANSFERENCIA">Transferências</option>
          </select>
        </div>

        {/* Operation Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Operação:</span>
          <select
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded-md focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="DESCARGA">Descarga</option>
            <option value="CARGA">Carga</option>
            <option value="MISTA">Mista</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Data / Hora</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Placa / Veículo</th>
              <th className="px-4 py-3">Motorista & Transportadora</th>
              <th className="px-4 py-3">Operação / Carga</th>
              <th className="px-4 py-3">Localização (De &rarr; Para)</th>
              <th className="px-4 py-3">Duração</th>
              <th className="px-4 py-3">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-500">
                  Nenhum registro de movimentação encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Timestamp */}
                  <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                    {formatDateTime(item.timestamp)}
                  </td>

                  {/* Action Badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getActionBadge(item.actionType)}
                  </td>

                  {/* Plate */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {item.plate}
                    </span>
                  </td>

                  {/* Driver & Carrier */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{item.driverName}</div>
                    <div className="text-[11px] text-slate-400">{item.carrier}</div>
                  </td>

                  {/* Operation & Cargo */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.operationType === 'DESCARGA'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-purple-500/10 text-purple-400'
                        }`}
                      >
                        {item.operationType}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.cargoType}</span>
                    </div>
                  </td>

                  {/* From -> To Location */}
                  <td className="px-4 py-3 text-[11px]">
                    <span className="text-slate-400">{item.fromLocation || '-'}</span>
                    {item.toLocation && (
                      <>
                        <span className="mx-1.5 text-slate-600">&rarr;</span>
                        <span className="font-semibold text-slate-200">{item.toLocation}</span>
                      </>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3 font-mono font-semibold text-slate-200 whitespace-nowrap">
                    {item.durationMinutes ? formatDuration(item.durationMinutes) : '-'}
                  </td>

                  {/* Notes */}
                  <td className="px-4 py-3 text-[11px] text-slate-400 max-w-xs truncate" title={item.notes}>
                    {item.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
