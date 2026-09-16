import { useState, type FormEvent } from 'react';
import { 
  X, 
  Cloud, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  ExternalLink,
  Database,
  RotateCcw
} from 'lucide-react';
import { StorageStatus } from '../types';
import { configureBlobToken } from '../services/storageService';

interface StorageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageStatus: StorageStatus | null;
  onRefreshSync: () => Promise<void>;
  onResetData: () => Promise<void>;
}

export function StorageSettingsModal({
  isOpen,
  onClose,
  storageStatus,
  onRefreshSync,
  onResetData,
}: StorageSettingsModalProps) {
  const [blobTokenInput, setBlobTokenInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [tokenFeedback, setTokenFeedback] = useState<{ success?: boolean; msg?: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSaveToken = async (e: FormEvent) => {
    e.preventDefault();
    if (!blobTokenInput.trim()) return;

    setIsSavingToken(true);
    setTokenFeedback(null);
    try {
      const res = await configureBlobToken(blobTokenInput.trim());
      setTokenFeedback({ success: res.success, msg: res.message });
      if (res.success) {
        await onRefreshSync();
      }
    } catch (err: any) {
      setTokenFeedback({ success: false, msg: err?.message || 'Erro de comunicação' });
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await onRefreshSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const isVercelBlobActive = storageStatus?.provider === 'vercel_blob';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Armazenamento & Vercel Blob Storage
              </h3>
              <p className="text-xs text-slate-400">
                Sincronização persistente e integridade dos dados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Active Provider Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Provedor de Armazenamento Ativo
              </span>
              {isVercelBlobActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Vercel Blob Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <HardDrive className="w-3.5 h-3.5" />
                  Persistência Local Ativa
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {storageStatus?.message ||
                'Os dados de caminhões, docas e histórico são gravados automaticamente e não são perdidos ao fechar o navegador.'}
            </p>

            {storageStatus?.blobUrl && (
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="truncate">URL do Blob: {storageStatus.blobUrl}</span>
                <a
                  href={storageStatus.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Ver JSON</span>
                </a>
              </div>
            )}
          </div>

          {/* Sincronização em camadas */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <Cloud className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <span className="font-semibold block text-slate-200">Vercel Blob</span>
              <span className="text-[10px] text-slate-400">Nuvem Global</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <Database className="w-4 h-4 mx-auto mb-1 text-sky-400" />
              <span className="font-semibold block text-slate-200">Servidor Node</span>
              <span className="text-[10px] text-slate-400">Arquivo JSON</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
              <HardDrive className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <span className="font-semibold block text-slate-200">Navegador</span>
              <span className="text-[10px] text-slate-400">Cache Offline</span>
            </div>
          </div>

          {/* Vercel Blob Token Configuration */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Configurar Token do Vercel Blob</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">BLOB_READ_WRITE_TOKEN</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Para deploy ou sincronização na nuvem da Vercel, cole seu token de leitura e gravação abaixo (ou configure a variável de ambiente):
            </p>

            <form onSubmit={handleSaveToken} className="space-y-2">
              <input
                type="password"
                placeholder="vercel_blob_rw_..."
                value={blobTokenInput}
                onChange={(e) => setBlobTokenInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              {tokenFeedback && (
                <div
                  className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                    tokenFeedback.success
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {tokenFeedback.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  )}
                  <span>{tokenFeedback.msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingToken || !blobTokenInput.trim()}
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {isSavingToken ? 'Validando token com Vercel...' : 'Salvar e Conectar Vercel Blob'}
              </button>
            </form>
          </div>

          {/* Sync & Reset Tools */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Forçar Sincronização'}</span>
            </button>

            <button
              type="button"
              onClick={onResetData}
              className="px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restaura os dados padrão do CD"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetar Dados de Teste</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
