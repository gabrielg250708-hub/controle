import { useState, useEffect } from 'react';
import { 
  Truck as TruckIcon, 
  Cloud, 
  HardDrive, 
  Clock, 
  PlusCircle, 
  Layers, 
  History, 
  BarChart3, 
  Settings,
  AlertTriangle
} from 'lucide-react';
import { StorageStatus } from '../types';

interface HeaderProps {
  activeTrucksCount: number;
  maxCapacity: number;
  storageStatus: StorageStatus | null;
  activeTab: 'overview' | 'queue' | 'history' | 'reports';
  setActiveTab: (tab: 'overview' | 'queue' | 'history' | 'reports') => void;
  onOpenEntryModal: () => void;
  onOpenStorageModal: () => void;
  waitingCount: number;
}

export function Header({
  activeTrucksCount,
  maxCapacity,
  storageStatus,
  activeTab,
  setActiveTab,
  onOpenEntryModal,
  onOpenStorageModal,
  waitingCount,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const capacityPercentage = Math.round((activeTrucksCount / maxCapacity) * 100);
  const isHighCapacity = capacityPercentage >= 85;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-lg shadow-black/20">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          {/* Logo and CD Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <TruckIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    CD-01
                  </span>
                  <h1 className="text-base font-bold text-slate-100 tracking-tight">
                    Gestão de Fluxo de Caminhões
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Controle de 14 Docas • 8 Vagas Pátio • Rastreamento em Tempo Real
                </p>
              </div>
            </div>

            {/* Mobile Time & Action */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                id="btn-mobile-new-entry"
                onClick={onOpenEntryModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1 shadow transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Chegada</span>
              </button>
            </div>
          </div>

          {/* Center/Right Status Indicators */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{currentTime || '--:--:--'}</span>
            </div>

            {/* Real-Time Capacity Badge (Max 32) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Capacidade CD:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isHighCapacity ? 'bg-rose-500' : capacityPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, capacityPercentage)}%` }}
                  />
                </div>
                <span className={`font-mono font-bold ${isHighCapacity ? 'text-rose-400' : 'text-slate-200'}`}>
                  {activeTrucksCount}/{maxCapacity}
                </span>
              </div>
              {isHighCapacity && (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>

            {/* Storage Status (Vercel Blob / Local Server) */}
            <button
              id="btn-storage-status-header"
              onClick={onOpenStorageModal}
              title="Clique para ver detalhes do Vercel Blob e persistência"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              {storageStatus?.provider === 'vercel_blob' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-emerald-300 hidden lg:inline">Vercel Blob Ativo</span>
                  <span className="font-medium text-emerald-300 lg:hidden">Blob</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-medium text-slate-300 hidden lg:inline">Persistência Local</span>
                  <span className="font-medium text-slate-300 lg:hidden">Local</span>
                </>
              )}
              <Settings className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>

            {/* Primary Action Button (Desktop) */}
            <button
              id="btn-desktop-new-entry"
              onClick={onOpenEntryModal}
              className="hidden md:flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold px-4 py-1.5 rounded-md text-sm shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Chegada</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-t border-slate-800/80 -mb-px overflow-x-auto scrollbar-none">
          <button
            id="tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pátio & Docas (Visão Geral)</span>
          </button>

          <button
            id="tab-queue"
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer relative ${
              activeTab === 'queue'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Fila de Espera</span>
            {waitingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {waitingCount}
              </span>
            )}
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico de Movimentações</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Relatório & Indicadores</span>
          </button>
        </div>
      </div>
    </header>
  );
}
