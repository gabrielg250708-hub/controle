export type CargoType = 
  | 'Carga Geral'
  | 'Alimentos e Perecíveis'
  | 'Refrigerada / Congelada'
  | 'Eletrônicos e Alto Valor'
  | 'Químicos e Perigosos'
  | 'Granel'
  | 'Farmacêutica';

export type OperationType = 'DESCARGA' | 'CARGA' | 'MISTA';

export type TruckStatus = 'DOCA' | 'PATIO' | 'FILA' | 'FINALIZADO';

export interface Truck {
  id: string;
  plate: string;
  driverName: string;
  driverPhone?: string;
  carrier: string; // Transportadora
  cargoType: CargoType;
  operationType: OperationType;
  status: TruckStatus;
  locationId: string | null; // e.g. "D-01" to "D-14", "P-01" to "P-08", or null for FILA
  locationName?: string;
  entryTime: string; // ISO string
  dockAssignedTime?: string; // ISO string when docked
  exitTime?: string; // ISO string when departed
  targetDurationMinutes?: number; // Estimated standard operation time (default 60-90 min)
  notes?: string;
}

export interface Dock {
  id: string;
  number: number;
  name: string;
  isOccupied: boolean;
  currentTruckId: string | null;
  allowedOperations?: ('CARGA' | 'DESCARGA' | 'TODAS')[];
  temperatureControlled?: boolean;
}

export interface ParkingSpace {
  id: string;
  number: number;
  name: string;
  isOccupied: boolean;
  currentTruckId: string | null;
}

export type ActionType = 'ENTRADA' | 'ALOCACAO_DOCA' | 'ALOCACAO_PATIO' | 'TRANSFERENCIA' | 'SAIDA';

export interface MovementHistoryItem {
  id: string;
  truckId: string;
  plate: string;
  driverName: string;
  carrier: string;
  cargoType: CargoType;
  operationType: OperationType;
  actionType: ActionType;
  fromLocation?: string;
  toLocation?: string;
  timestamp: string; // ISO
  durationMinutes?: number; // Total or stage duration
  notes?: string;
}

export interface AppState {
  docks: Dock[];
  parkingSpaces: ParkingSpace[];
  activeTrucks: Truck[];
  history: MovementHistoryItem[];
  lastUpdated: string;
}

export interface StorageStatus {
  provider: 'vercel_blob' | 'local_server' | 'browser_cache';
  isConnected: boolean;
  hasBlobToken: boolean;
  lastSyncedAt?: string;
  blobUrl?: string;
  message?: string;
}
