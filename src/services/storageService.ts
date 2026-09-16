import { AppState, StorageStatus } from '../types';
import { getInitialState } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'fluxo_patio_cd_state_v1';

export async function fetchCurrentState(): Promise<{ state: AppState; source: string; blobUrl?: string }> {
  // 1. First attempt to fetch from backend server (which integrates with Vercel Blob / local file)
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.state && data.state.docks && data.state.docks.length > 0) {
        // Cache in browser localStorage as backup
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.state));
        } catch {
          // Ignore localStorage quota limits
        }
        return {
          state: data.state,
          source: data.source || 'server',
          blobUrl: data.blobUrl,
        };
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar estado do servidor:', err);
  }

  // 2. Fallback to localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.docks) {
        return { state: parsed, source: 'browser_cache' };
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar do cache local:', err);
  }

  // 3. Fallback to fresh initial distribution center state
  const initial = getInitialState();
  return { state: initial, source: 'initial' };
}

export async function saveCurrentState(state: AppState): Promise<{
  success: boolean;
  persistedVercelBlob?: boolean;
  blobUrl?: string;
  error?: string;
}> {
  // 1. Immediately cache in localStorage for instant responsiveness
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Falha ao gravar no localStorage:', e);
  }

  // 2. Sync with backend (Vercel Blob + server storage)
  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });

    if (response.ok) {
      const resData = await response.json();
      return {
        success: true,
        persistedVercelBlob: resData.persistedVercelBlob,
        blobUrl: resData.blobUrl,
      };
    } else {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `Erro HTTP ${response.status}`,
      };
    }
  } catch (err: any) {
    console.error('Erro de rede ao salvar estado no servidor:', err);
    return {
      success: false,
      error: err?.message || 'Erro de conexão com o servidor',
    };
  }
}

export async function checkStorageStatus(): Promise<StorageStatus> {
  try {
    const response = await fetch('/api/storage/status');
    if (response.ok) {
      const data = await response.json();
      return {
        provider: data.provider,
        isConnected: data.blobAccessible || data.localFileExists,
        hasBlobToken: data.hasBlobToken,
        lastSyncedAt: new Date().toISOString(),
        blobUrl: data.latestBlobUrl,
        message: data.message,
      };
    }
  } catch (err: any) {
    console.warn('Erro ao checar status de armazenamento:', err);
  }

  return {
    provider: 'browser_cache',
    isConnected: true,
    hasBlobToken: false,
    message: 'Operando em modo offline com persistência em cache local.',
  };
}

export async function configureBlobToken(token: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/storage/set-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      return { success: true, message: data.message || 'Token validado com sucesso!' };
    }
    return { success: false, message: data.error || 'Falha ao validar token' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro de conexão' };
  }
}
