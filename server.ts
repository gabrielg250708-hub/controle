import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { put, list, head } from '@vercel/blob';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_STATE_FILE = path.join(DATA_DIR, 'state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Runtime token cache in case user sets it in UI
let runtimeBlobToken = process.env.BLOB_READ_WRITE_TOKEN || '';

const getActiveToken = () => runtimeBlobToken || process.env.BLOB_READ_WRITE_TOKEN || '';

// Helper to load fallback local state
function readLocalState(): any | null {
  try {
    if (fs.existsSync(LOCAL_STATE_FILE)) {
      const data = fs.readFileSync(LOCAL_STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao ler estado local:', err);
  }
  return null;
}

// Helper to save local state
function writeLocalState(state: any): boolean {
  try {
    fs.writeFileSync(LOCAL_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao salvar estado local:', err);
    return false;
  }
}

// ================= API ROUTES =================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    blobTokenConfigured: Boolean(getActiveToken()),
  });
});

// Storage status & configuration info
app.get('/api/storage/status', async (req, res) => {
  const token = getActiveToken();
  const hasToken = Boolean(token && token.trim() !== '');

  let blobAccessible = false;
  let latestBlobUrl = null;
  let statusMessage = '';

  if (hasToken) {
    try {
      const blobs = await list({ token, prefix: 'truck-flow/' });
      blobAccessible = true;
      const found = blobs.blobs.find((b) => b.pathname === 'truck-flow/state.json');
      if (found) {
        latestBlobUrl = found.url;
      }
      statusMessage = 'Vercel Blob Storage conectado e operacional.';
    } catch (err: any) {
      console.warn('Vercel Blob token check failed:', err?.message);
      statusMessage = `Vercel Blob configurado, mas erro ao conectar: ${err?.message || 'Token inválido ou sem permissão'}`;
    }
  } else {
    statusMessage = 'Armazenamento persistente local ativo. Configure BLOB_READ_WRITE_TOKEN para Vercel Blob.';
  }

  res.json({
    provider: hasToken && blobAccessible ? 'vercel_blob' : 'local_server',
    hasBlobToken: hasToken,
    blobAccessible,
    latestBlobUrl,
    message: statusMessage,
    localFileExists: fs.existsSync(LOCAL_STATE_FILE),
  });
});

// Set or update blob token at runtime (operator convenience)
app.post('/api/storage/set-token', async (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token inválido' });
  }

  const trimmed = token.trim();
  try {
    // Validate by listing blobs
    await list({ token: trimmed, limit: 1 });
    runtimeBlobToken = trimmed;
    return res.json({ success: true, message: 'Token do Vercel Blob validado e conectado com sucesso!' });
  } catch (err: any) {
    return res.status(400).json({
      error: `Não foi possível validar o token do Vercel Blob: ${err?.message || 'Erro desconhecido'}`,
    });
  }
});

// GET current state
app.get('/api/state', async (req, res) => {
  const token = getActiveToken();

  // 1. Try Vercel Blob if token exists
  if (token) {
    try {
      const { blobs } = await list({ token, prefix: 'truck-flow/state.json' });
      const stateBlob = blobs.find((b) => b.pathname === 'truck-flow/state.json');
      if (stateBlob && stateBlob.url) {
        const response = await fetch(stateBlob.url, { cache: 'no-store' });
        if (response.ok) {
          const blobData = await response.json();
          // Also sync to local file for fast cache
          writeLocalState(blobData);
          return res.json({
            source: 'vercel_blob',
            blobUrl: stateBlob.url,
            state: blobData,
          });
        }
      }
    } catch (err) {
      console.warn('Falha ao obter estado do Vercel Blob, usando fallback local:', err);
    }
  }

  // 2. Fallback to local server state file
  const local = readLocalState();
  if (local) {
    return res.json({
      source: 'local_server',
      state: local,
    });
  }

  // 3. No stored state yet, client will supply initial state
  res.json({
    source: 'empty',
    state: null,
  });
});

// POST save current state
app.post('/api/state', async (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ error: 'Dados do estado ausentes' });
  }

  state.lastUpdated = new Date().toISOString();

  // 1. Always save locally for instant resilience
  writeLocalState(state);

  const token = getActiveToken();
  let vercelBlobSuccess = false;
  let blobUrl: string | null = null;
  let blobError: string | null = null;

  // 2. Sync to Vercel Blob if token available
  if (token) {
    try {
      const blobResult = await put('truck-flow/state.json', JSON.stringify(state, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        token,
      });
      vercelBlobSuccess = true;
      blobUrl = blobResult.url;
    } catch (err: any) {
      console.error('Erro ao salvar no Vercel Blob:', err);
      blobError = err?.message || 'Falha no upload para Vercel Blob';
    }
  }

  res.json({
    success: true,
    lastUpdated: state.lastUpdated,
    persistedLocal: true,
    persistedVercelBlob: vercelBlobSuccess,
    blobUrl,
    blobError,
    activeProvider: vercelBlobSuccess ? 'vercel_blob' : 'local_server',
  });
});

// Reset state to initial (for demo or testing)
app.post('/api/state/reset', (req, res) => {
  try {
    if (fs.existsSync(LOCAL_STATE_FILE)) {
      fs.unlinkSync(LOCAL_STATE_FILE);
    }
    res.json({ success: true, message: 'Estado resetado com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao resetar' });
  }
});

// ================= VITE & PRODUCTION SETUP =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Logistics Truck Flow Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
