import { useState, useEffect, useCallback, useTransition } from 'react';
import { 
  fetchCurrentState, 
  saveCurrentState, 
  checkStorageStatus 
} from './services/storageService';
import { getInitialState } from './data/initialData';
import { 
  AppState, 
  Truck, 
  StorageStatus, 
  MovementHistoryItem 
} from './types';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { DockLayout } from './components/DockLayout';
import { ParkingYardLayout } from './components/ParkingYardLayout';
import { QueueView } from './components/QueueView';
import { HistoryView } from './components/HistoryView';
import { ReportsView } from './components/ReportsView';
import { TruckEntryModal } from './components/TruckEntryModal';
import { TruckExitModal } from './components/TruckExitModal';
import { AllocateModal } from './components/AllocateModal';
import { TruckDetailsModal } from './components/TruckDetailsModal';
import { StorageSettingsModal } from './components/StorageSettingsModal';
import { getElapsedMinutes } from './utils/formatters';
import { CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

const MAX_TRUCKS_CAPACITY = 32;

export default function App() {
  const [, startTransition] = useTransition();

  // Core CD State
  const [appState, setAppState] = useState<AppState>(getInitialState());
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'history' | 'reports'>('overview');

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [preSelectedDockId, setPreSelectedDockId] = useState<string | null>(null);
  const [preSelectedSpaceId, setPreSelectedSpaceId] = useState<string | null>(null);

  const [exitTruck, setExitTruck] = useState<Truck | null>(null);
  const [allocateTruck, setAllocateTruck] = useState<Truck | null>(null);
  const [detailsTruck, setDetailsTruck] = useState<Truck | null>(null);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 1. Initial Load from Backend & Vercel Blob
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const { state: loadedState, source } = await fetchCurrentState();
        if (isMounted && loadedState && loadedState.docks) {
          setAppState(loadedState);
          if (source === 'vercel_blob') {
            showToast('Dados carregados com sucesso do Vercel Blob Storage!', 'success');
          }
        }
        const status = await checkStorageStatus();
        if (isMounted) {
          setStorageStatus(status);
        }
      } catch (err) {
        console.error('Erro ao inicializar estado:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Periodic timer to keep minutes updated smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      // Trigger subtle re-render for elapsed times
      setAppState((prev) => ({ ...prev }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync Helper to persist whenever appState changes
  const persistState = useCallback(async (newState: AppState) => {
    setAppState(newState);
    const res = await saveCurrentState(newState);
    if (res.persistedVercelBlob) {
      setStorageStatus((prev) => prev ? { ...prev, provider: 'vercel_blob', isConnected: true } : null);
    }
  }, []);

  // --- ACTIONS ---

  // 1. Register Truck Arrival
  const handleTruckEntry = (truckData: Omit<Truck, 'id'>) => {
    const newTruckId = `TRK-${Date.now().toString().slice(-4)}`;
    const newTruck: Truck = {
      ...truckData,
      id: newTruckId,
    };

    // Update docks or parking spaces if assigned
    const updatedDocks = appState.docks.map((dock) => {
      if (newTruck.status === 'DOCA' && dock.id === newTruck.locationId) {
        return { ...dock, isOccupied: true, currentTruckId: newTruck.id };
      }
      return dock;
    });

    const updatedParking = appState.parkingSpaces.map((space) => {
      if (newTruck.status === 'PATIO' && space.id === newTruck.locationId) {
        return { ...space, isOccupied: true, currentTruckId: newTruck.id };
      }
      return space;
    });

    const newHistoryItem: MovementHistoryItem = {
      id: `HIST-${Date.now()}`,
      truckId: newTruck.id,
      plate: newTruck.plate,
      driverName: newTruck.driverName,
      carrier: newTruck.carrier,
      cargoType: newTruck.cargoType,
      operationType: newTruck.operationType,
      actionType: 'ENTRADA',
      fromLocation: 'Portaria (Entrada)',
      toLocation: newTruck.locationName || newTruck.status,
      timestamp: new Date().toISOString(),
      durationMinutes: 0,
      notes: newTruck.notes || 'Entrada registrada no centro de distribuição',
    };

    const newState: AppState = {
      ...appState,
      docks: updatedDocks,
      parkingSpaces: updatedParking,
      activeTrucks: [newTruck, ...appState.activeTrucks],
      history: [newHistoryItem, ...appState.history],
      lastUpdated: new Date().toISOString(),
    };

    persistState(newState);
    showToast(`Chegada registrada: Caminhão ${newTruck.plate} direcionado para ${newTruck.locationName || 'Portaria'}.`);
  };

  // 2. Register Truck Exit / Departure
  const handleTruckExit = (truck: Truck, exitNotes: string) => {
    const totalMinutes = getElapsedMinutes(truck.entryTime);

    // Free the dock or parking space
    const updatedDocks = appState.docks.map((dock) => {
      if (dock.currentTruckId === truck.id) {
        return { ...dock, isOccupied: false, currentTruckId: null };
      }
      return dock;
    });

    const updatedParking = appState.parkingSpaces.map((space) => {
      if (space.currentTruckId === truck.id) {
        return { ...space, isOccupied: false, currentTruckId: null };
      }
      return space;
    });

    // Remove from active trucks
    const updatedActiveTrucks = appState.activeTrucks.filter((t) => t.id !== truck.id);

    const newHistoryItem: MovementHistoryItem = {
      id: `HIST-${Date.now()}`,
      truckId: truck.id,
      plate: truck.plate,
      driverName: truck.driverName,
      carrier: truck.carrier,
      cargoType: truck.cargoType,
      operationType: truck.operationType,
      actionType: 'SAIDA',
      fromLocation: truck.locationName || truck.status,
      toLocation: 'Portaria (Saída Liberada)',
      timestamp: new Date().toISOString(),
      durationMinutes: totalMinutes,
      notes: exitNotes,
    };

    const newState: AppState = {
      ...appState,
      docks: updatedDocks,
      parkingSpaces: updatedParking,
      activeTrucks: updatedActiveTrucks,
      history: [newHistoryItem, ...appState.history],
      lastUpdated: new Date().toISOString(),
    };

    persistState(newState);

    // Check if there are trucks in the queue to notify operator
    const queueTrucks = updatedActiveTrucks.filter((t) => t.status === 'FILA');
    if (queueTrucks.length > 0) {
      showToast(
        `Saída do caminhão ${truck.plate} concluída. Atenção: há ${queueTrucks.length} veículo(s) aguardando na Fila de Espera!`,
        'info'
      );
    } else {
      showToast(`Saída do caminhão ${truck.plate} registrada. Local liberado com sucesso!`);
    }
  };

  // 3. Allocate / Transfer Truck
  const handleAllocation = (
    truck: Truck,
    targetType: 'DOCK' | 'PARKING',
    targetId: string,
    targetName: string
  ) => {
    const oldLocationName = truck.locationName || truck.status;
    const now = new Date().toISOString();

    // 1. Free previous location
    const updatedDocks = appState.docks.map((dock) => {
      if (dock.currentTruckId === truck.id) {
        return { ...dock, isOccupied: false, currentTruckId: null };
      }
      if (targetType === 'DOCK' && dock.id === targetId) {
        return { ...dock, isOccupied: true, currentTruckId: truck.id };
      }
      return dock;
    });

    const updatedParking = appState.parkingSpaces.map((space) => {
      if (space.currentTruckId === truck.id) {
        return { ...space, isOccupied: false, currentTruckId: null };
      }
      if (targetType === 'PARKING' && space.id === targetId) {
        return { ...space, isOccupied: true, currentTruckId: truck.id };
      }
      return space;
    });

    // 2. Update truck record
    const updatedActiveTrucks = appState.activeTrucks.map((t) => {
      if (t.id === truck.id) {
        return {
          ...t,
          status: targetType === 'DOCK' ? ('DOCA' as const) : ('PATIO' as const),
          locationId: targetId,
          locationName: targetName,
          dockAssignedTime: targetType === 'DOCK' ? now : t.dockAssignedTime,
        };
      }
      return t;
    });

    const actionType = truck.status === 'FILA' 
      ? (targetType === 'DOCK' ? 'ALOCACAO_DOCA' : 'ALOCACAO_PATIO')
      : 'TRANSFERENCIA';

    const newHistoryItem: MovementHistoryItem = {
      id: `HIST-${Date.now()}`,
      truckId: truck.id,
      plate: truck.plate,
      driverName: truck.driverName,
      carrier: truck.carrier,
      cargoType: truck.cargoType,
      operationType: truck.operationType,
      actionType,
      fromLocation: oldLocationName,
      toLocation: targetName,
      timestamp: now,
      durationMinutes: getElapsedMinutes(truck.entryTime),
      notes: `Alocação efetuada: ${oldLocationName} para ${targetName}`,
    };

    const newState: AppState = {
      ...appState,
      docks: updatedDocks,
      parkingSpaces: updatedParking,
      activeTrucks: updatedActiveTrucks,
      history: [newHistoryItem, ...appState.history],
      lastUpdated: now,
    };

    persistState(newState);
    showToast(`Veículo ${truck.plate} alocado com sucesso em ${targetName}.`);
  };

  // Quick helper to select a free dock or space for entry
  const handleSelectDockForEntry = (dockId: string) => {
    setPreSelectedDockId(dockId);
    setPreSelectedSpaceId(null);
    setIsEntryModalOpen(true);
  };

  const handleSelectSpaceForEntry = (spaceId: string) => {
    setPreSelectedSpaceId(spaceId);
    setPreSelectedDockId(null);
    setIsEntryModalOpen(true);
  };

  // Reset to default CD data
  const handleResetData = async () => {
    if (window.confirm('Deseja realmente restaurar os dados de exemplo padrão do Centro de Distribuição?')) {
      const initial = getInitialState();
      await persistState(initial);
      showToast('Dados restaurados para o padrão operacional do CD.');
      setIsStorageModalOpen(false);
    }
  };

  // Force sync
  const handleRefreshSync = async () => {
    const { state: freshState } = await fetchCurrentState();
    if (freshState) {
      setAppState(freshState);
    }
    const status = await checkStorageStatus();
    setStorageStatus(status);
    showToast('Sincronização executada com sucesso.');
  };

  const waitingCount = appState.activeTrucks.filter((t) => t.status === 'FILA').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'info'
                ? 'bg-sky-950 border-sky-500/50 text-sky-200'
                : toast.type === 'warn'
                ? 'bg-amber-950 border-amber-500/50 text-amber-200'
                : 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.type === 'info' ? (
              <AlertCircle className="w-4 h-4 text-sky-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        activeTrucksCount={appState.activeTrucks.length}
        maxCapacity={MAX_TRUCKS_CAPACITY}
        storageStatus={storageStatus}
        activeTab={activeTab}
        setActiveTab={(tab) => startTransition(() => setActiveTab(tab))}
        onOpenEntryModal={() => {
          setPreSelectedDockId(null);
          setPreSelectedSpaceId(null);
          setIsEntryModalOpen(true);
        }}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
        waitingCount={waitingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-sm font-semibold">Carregando dados do Centro de Distribuição...</span>
          </div>
        ) : (
          <>
            {/* KPI Overview Strip */}
            <KPICards
              docks={appState.docks}
              parkingSpaces={appState.parkingSpaces}
              activeTrucks={appState.activeTrucks}
              history={appState.history}
              onSelectTab={(tab) => startTransition(() => setActiveTab(tab))}
            />

            {/* Tab 1: Overview (Docas + Pátio) */}
            {activeTab === 'overview' && (
              <div className="space-y-2">
                {/* 14 Docks Section */}
                <DockLayout
                  docks={appState.docks}
                  activeTrucks={appState.activeTrucks}
                  onOpenExitModal={(t) => setExitTruck(t)}
                  onSelectDockForEntry={handleSelectDockForEntry}
                  onOpenTruckDetails={(t) => setDetailsTruck(t)}
                />

                {/* 8 Parking Spaces Section */}
                <ParkingYardLayout
                  parkingSpaces={appState.parkingSpaces}
                  activeTrucks={appState.activeTrucks}
                  docks={appState.docks}
                  onOpenExitModal={(t) => setExitTruck(t)}
                  onOpenAllocateModal={(t) => setAllocateTruck(t)}
                  onSelectSpaceForEntry={handleSelectSpaceForEntry}
                  onOpenTruckDetails={(t) => setDetailsTruck(t)}
                />

                {/* Quick Queue Banner if there are trucks waiting */}
                {waitingCount > 0 && (
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-200">
                          {waitingCount} {waitingCount === 1 ? 'veículo aguardando' : 'veículos aguardando'} na Fila de Espera
                        </h4>
                        <p className="text-xs text-slate-400">
                          Consulte a aba Fila de Espera para alocação prioritária assim que docas forem liberadas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow whitespace-nowrap"
                    >
                      Ver Fila de Espera &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Queue View */}
            {activeTab === 'queue' && (
              <QueueView
                activeTrucks={appState.activeTrucks}
                docks={appState.docks}
                parkingSpaces={appState.parkingSpaces}
                onOpenAllocateModal={(t) => setAllocateTruck(t)}
                onOpenExitModal={(t) => setExitTruck(t)}
                onOpenEntryModal={() => {
                  setPreSelectedDockId(null);
                  setPreSelectedSpaceId(null);
                  setIsEntryModalOpen(true);
                }}
              />
            )}

            {/* Tab 3: History View */}
            {activeTab === 'history' && (
              <HistoryView history={appState.history} />
            )}

            {/* Tab 4: Reports & Analytics */}
            {activeTab === 'reports' && (
              <ReportsView
                docks={appState.docks}
                parkingSpaces={appState.parkingSpaces}
                activeTrucks={appState.activeTrucks}
                history={appState.history}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-500 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Centro de Distribuição • Sistema de Controle Logístico em Tempo Real
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsStorageModalOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Vercel Blob / Armazenamento:</span>
              <span className="font-mono text-emerald-400">
                {storageStatus?.provider === 'vercel_blob' ? 'Conectado' : 'Local Ativo'}
              </span>
            </button>
            <span>•</span>
            <span className="font-mono">Capacidade: {MAX_TRUCKS_CAPACITY} caminhões</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Truck Entry Modal */}
      <TruckEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setPreSelectedDockId(null);
          setPreSelectedSpaceId(null);
        }}
        docks={appState.docks}
        parkingSpaces={appState.parkingSpaces}
        preSelectedDockId={preSelectedDockId}
        preSelectedSpaceId={preSelectedSpaceId}
        activeTrucksCount={appState.activeTrucks.length}
        maxCapacity={MAX_TRUCKS_CAPACITY}
        onSubmit={handleTruckEntry}
      />

      {/* 2. Truck Exit Modal */}
      <TruckExitModal
        isOpen={Boolean(exitTruck)}
        truck={exitTruck}
        onClose={() => setExitTruck(null)}
        onConfirmExit={handleTruckExit}
      />

      {/* 3. Allocate Modal */}
      <AllocateModal
        isOpen={Boolean(allocateTruck)}
        truck={allocateTruck}
        onClose={() => setAllocateTruck(null)}
        docks={appState.docks}
        parkingSpaces={appState.parkingSpaces}
        onConfirmAllocation={handleAllocation}
      />

      {/* 4. Truck Details Modal */}
      <TruckDetailsModal
        isOpen={Boolean(detailsTruck)}
        truck={detailsTruck}
        onClose={() => setDetailsTruck(null)}
        onOpenExit={(t) => setExitTruck(t)}
        onOpenAllocate={(t) => setAllocateTruck(t)}
      />

      {/* 5. Storage / Vercel Blob Settings Modal */}
      <StorageSettingsModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        storageStatus={storageStatus}
        onRefreshSync={handleRefreshSync}
        onResetData={handleResetData}
      />
    </div>
  );
}
