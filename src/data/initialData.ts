import { AppState, Dock, ParkingSpace, Truck, MovementHistoryItem } from '../types';

export const INITIAL_DOCKS: Dock[] = Array.from({ length: 14 }, (_, i) => {
  const num = i + 1;
  const numStr = num < 10 ? `0${num}` : `${num}`;
  return {
    id: `D-${numStr}`,
    number: num,
    name: `Doca ${numStr}`,
    isOccupied: false,
    currentTruckId: null,
    allowedOperations: num <= 4 ? ['DESCARGA'] : num >= 11 ? ['CARGA'] : ['TODAS'],
    temperatureControlled: num === 1 || num === 2 || num === 13 || num === 14,
  };
});

export const INITIAL_PARKING_SPACES: ParkingSpace[] = Array.from({ length: 8 }, (_, i) => {
  const num = i + 1;
  const numStr = `0${num}`;
  return {
    id: `P-${numStr}`,
    number: num,
    name: `Vaga P${numStr}`,
    isOccupied: false,
    currentTruckId: null,
  };
});

// Helper to create date relative to now
const minutesAgo = (mins: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
};

export const INITIAL_TRUCKS: Truck[] = [
  {
    id: 'TRK-101',
    plate: 'BRA-2E19',
    driverName: 'Carlos Eduardo Silva',
    driverPhone: '(11) 98765-4321',
    carrier: 'TransLog Brasil',
    cargoType: 'Alimentos e Perecíveis',
    operationType: 'DESCARGA',
    status: 'DOCA',
    locationId: 'D-02',
    locationName: 'Doca 02 (Refrigerada)',
    entryTime: minutesAgo(85),
    dockAssignedTime: minutesAgo(70),
    targetDurationMinutes: 90,
    notes: 'Nota Fiscal #84920 - Conferência de paletes em andamento',
  },
  {
    id: 'TRK-102',
    plate: 'MER-4K88',
    driverName: 'Marcos Vinicius Pereira',
    driverPhone: '(19) 99123-8833',
    carrier: 'Expresso Rápido SP',
    cargoType: 'Eletrônicos e Alto Valor',
    operationType: 'CARGA',
    status: 'DOCA',
    locationId: 'D-12',
    locationName: 'Doca 12',
    entryTime: minutesAgo(110),
    dockAssignedTime: minutesAgo(45),
    targetDurationMinutes: 60,
    notes: 'Carregamento prioritário para filial Curitiba',
  },
  {
    id: 'TRK-103',
    plate: 'RJR-9A52',
    driverName: 'Antônio José Barbosa',
    driverPhone: '(21) 97654-1122',
    carrier: 'Rodoviário Aliança',
    cargoType: 'Carga Geral',
    operationType: 'DESCARGA',
    status: 'DOCA',
    locationId: 'D-05',
    locationName: 'Doca 05',
    entryTime: minutesAgo(140),
    dockAssignedTime: minutesAgo(95),
    targetDurationMinutes: 75,
    notes: 'Insumos industriais - Paletizado',
  },
  {
    id: 'TRK-104',
    plate: 'SCN-7H33',
    driverName: 'Roberto Albuquerque',
    driverPhone: '(41) 98844-5566',
    carrier: 'Sul Cargas Express',
    cargoType: 'Farmacêutica',
    operationType: 'CARGA',
    status: 'DOCA',
    locationId: 'D-08',
    locationName: 'Doca 08',
    entryTime: minutesAgo(40),
    dockAssignedTime: minutesAgo(25),
    targetDurationMinutes: 50,
    notes: 'Produtos hospitalares - Lacre #49102',
  },
  {
    id: 'TRK-105',
    plate: 'BHM-3C71',
    driverName: 'Luciano Mendes Rocha',
    driverPhone: '(31) 99555-1234',
    carrier: 'Minas Vias Transportes',
    cargoType: 'Químicos e Perigosos',
    operationType: 'DESCARGA',
    status: 'PATIO',
    locationId: 'P-01',
    locationName: 'Vaga P01',
    entryTime: minutesAgo(65),
    targetDurationMinutes: 60,
    notes: 'Aguardando liberação de documentação de segurança ambiental',
  },
  {
    id: 'TRK-106',
    plate: 'FSA-5D20',
    driverName: 'Geraldo Ferreira Neto',
    driverPhone: '(71) 98112-9900',
    carrier: 'Bahia Cargas',
    cargoType: 'Carga Geral',
    operationType: 'CARGA',
    status: 'PATIO',
    locationId: 'P-04',
    locationName: 'Vaga P04',
    entryTime: minutesAgo(50),
    targetDurationMinutes: 75,
    notes: 'Aguardando finalização do picking no armazém',
  },
  {
    id: 'TRK-107',
    plate: 'POA-8F44',
    driverName: 'Darcy Fontana Filho',
    driverPhone: '(51) 99234-7711',
    carrier: 'Gaúcha Logística',
    cargoType: 'Granel',
    operationType: 'DESCARGA',
    status: 'PATIO',
    locationId: 'P-07',
    locationName: 'Vaga P07',
    entryTime: minutesAgo(30),
    targetDurationMinutes: 60,
    notes: 'Carga ensacada - Pátio de espera',
  },
  {
    id: 'TRK-108',
    plate: 'PRT-1G90',
    driverName: 'Sebastião Fagundes',
    driverPhone: '(43) 98777-2233',
    carrier: 'Paraná Express',
    cargoType: 'Alimentos e Perecíveis',
    operationType: 'DESCARGA',
    status: 'FILA',
    locationId: null,
    locationName: 'Fila de Espera (Portaria)',
    entryTime: minutesAgo(20),
    targetDurationMinutes: 80,
    notes: 'Aguardando liberação de doca refrigerada (D-01 ou D-02)',
  },
  {
    id: 'TRK-109',
    plate: 'VIX-6B15',
    driverName: 'Gilberto Sampaio',
    driverPhone: '(27) 99345-6677',
    carrier: 'Vitória Log',
    cargoType: 'Carga Geral',
    operationType: 'CARGA',
    status: 'FILA',
    locationId: null,
    locationName: 'Fila de Espera (Portaria)',
    entryTime: minutesAgo(12),
    targetDurationMinutes: 60,
    notes: 'Carregamento agendado janela 14h',
  },
];

export const INITIAL_HISTORY: MovementHistoryItem[] = [
  {
    id: 'HIST-001',
    truckId: 'TRK-090',
    plate: 'KLU-3921',
    driverName: 'Valdir dos Santos',
    carrier: 'Rodoviário Mercosul',
    cargoType: 'Carga Geral',
    operationType: 'DESCARGA',
    actionType: 'SAIDA',
    fromLocation: 'Doca 04',
    toLocation: 'Portaria (Saída Liberada)',
    timestamp: minutesAgo(15),
    durationMinutes: 68,
    notes: 'Descarga concluída com sucesso sem avarias',
  },
  {
    id: 'HIST-002',
    truckId: 'TRK-091',
    plate: 'GVR-1094',
    driverName: 'José Amaro Costa',
    carrier: 'TransVale',
    cargoType: 'Alimentos e Perecíveis',
    operationType: 'DESCARGA',
    actionType: 'SAIDA',
    fromLocation: 'Doca 01',
    toLocation: 'Portaria (Saída Liberada)',
    timestamp: minutesAgo(42),
    durationMinutes: 85,
    notes: 'Temperatura mantida a -18°C conferida',
  },
  {
    id: 'HIST-003',
    truckId: 'TRK-092',
    plate: 'CPQ-7782',
    driverName: 'Elias Rodrigues',
    carrier: 'Campinas Cargo',
    cargoType: 'Eletrônicos e Alto Valor',
    operationType: 'CARGA',
    actionType: 'SAIDA',
    fromLocation: 'Doca 11',
    toLocation: 'Portaria (Saída Liberada)',
    timestamp: minutesAgo(88),
    durationMinutes: 52,
    notes: 'Escolta armada acionada na saída',
  },
  {
    id: 'HIST-004',
    truckId: 'TRK-093',
    plate: 'RPO-6523',
    driverName: 'Henrique Guimarães',
    carrier: 'Triângulo Transportes',
    cargoType: 'Carga Geral',
    operationType: 'DESCARGA',
    actionType: 'SAIDA',
    fromLocation: 'Doca 07',
    toLocation: 'Portaria (Saída Liberada)',
    timestamp: minutesAgo(135),
    durationMinutes: 72,
    notes: 'Paletes padrão PBR liberados',
  },
  {
    id: 'HIST-005',
    truckId: 'TRK-094',
    plate: 'JDF-4412',
    driverName: 'Maurício Antunes',
    carrier: 'Express Nordeste',
    cargoType: 'Farmacêutica',
    operationType: 'DESCARGA',
    actionType: 'SAIDA',
    fromLocation: 'Doca 03',
    toLocation: 'Portaria (Saída Liberada)',
    timestamp: minutesAgo(180),
    durationMinutes: 60,
    notes: 'Lotes inspecionados pela qualidade',
  },
  {
    id: 'HIST-006',
    truckId: 'TRK-095',
    plate: 'SJP-8891',
    driverName: 'Claudemir Ramos',
    carrier: 'TransPinheiro',
    cargoType: 'Granel',
    operationType: 'CARGA',
    actionType: 'SAIDA',
    fromLocation: 'Doca 13',
    toLocation: 'Portaria (Saída Liberada)',
    timestamp: minutesAgo(240),
    durationMinutes: 94,
    notes: 'Pesagem na balança confirmada dentro do PBT',
  },
];

export function getInitialState(): AppState {
  // Wire up docks and parking with the initial active trucks
  const docks = INITIAL_DOCKS.map((dock) => {
    const truck = INITIAL_TRUCKS.find((t) => t.status === 'DOCA' && t.locationId === dock.id);
    return {
      ...dock,
      isOccupied: !!truck,
      currentTruckId: truck ? truck.id : null,
    };
  });

  const parkingSpaces = INITIAL_PARKING_SPACES.map((space) => {
    const truck = INITIAL_TRUCKS.find((t) => t.status === 'PATIO' && t.locationId === space.id);
    return {
      ...space,
      isOccupied: !!truck,
      currentTruckId: truck ? truck.id : null,
    };
  });

  return {
    docks,
    parkingSpaces,
    activeTrucks: INITIAL_TRUCKS,
    history: INITIAL_HISTORY,
    lastUpdated: new Date().toISOString(),
  };
}
