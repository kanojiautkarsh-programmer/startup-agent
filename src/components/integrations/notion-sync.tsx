'use client';

import { useState } from 'react';
import { Brain, RefreshCw, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NotionDocument {
  id: string;
  title: string;
  metadata?: { source_url?: string };
}

interface NotionStatus {
  connected: boolean;
  workspaceName: string | null;
  lastSync: string | null;
  documentsCount: number;
  documents?: NotionDocument[];
}

export function NotionSync() {
  const [status, setStatus] = useState<NotionStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const supabase = createClient();

  const fetchStatus = async () => {
    const response = await fetch('/api/integrations/notion/status');
    if (response.ok) {
      const data = await response.json();
      setStatus(data);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    window.location.href = '/api/integrations/notion';
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/integrations/notion/sync', {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchStatus();
      }
    } finally {
      setSyncing(false);
    }
  };

  if (!status) {
    fetchStatus();
    return <div className="animate-pulse h-20 bg-muted rounded-lg" />;
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233L11.684.373c.046-.373.233-.653.56-.653l3.456.14c.84.14.794.793.841 1.213l-.654 8.505 2.826-.14c.7 0 .654.654.654.933z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Notion</h3>
            <p className="text-sm text-muted-foreground">
              {status.connected ? status.workspaceName || 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        
        {status.connected ? (
          <div className="flex items-center gap-2">
            {status.documentsCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {status.documentsCount} documents indexed
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Notion'}
          </button>
        )}
      </div>

      {status.lastSync && (
        <p className="text-xs text-muted-foreground">
          Last synced: {new Date(status.lastSync).toLocaleString()}
        </p>
      )}

      {status.documentsCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {status.documents?.slice(0, 5).map((doc: any) => (
            <a
              key={doc.id}
              href={doc.metadata?.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs hover:bg-muted/80"
            >
              {doc.title}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
