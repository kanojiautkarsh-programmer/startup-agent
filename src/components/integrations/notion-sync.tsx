'use client';

import { useState } from 'react';
import { RefreshCw, ExternalLink, Check, ChevronRight, Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

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
    return <div className="animate-pulse h-32 bg-muted/20 border border-border/40 rounded-[3rem]" />;
  }

  return (
    <div className="glass-card border border-border/40 rounded-[3rem] p-8 md:p-10 hover:border-primary/20 hover:shadow-2xl transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 bg-card border border-border shadow-xl rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
            <svg className="w-9 h-9 text-[#2D211B]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233L11.684.373c.046-.373.233-.653.56-.653l3.456.14c.84.14.794.793.841 1.213l-.654 8.505 2.826-.14c.7 0 .654.654.654.933z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-3xl font-medium tracking-tight mb-2">Notion Workspace</h3>
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                status.connected ? "text-green-600" : "text-muted-foreground/40"
              )}>
                {status.connected ? status.workspaceName || 'Linked Engine' : 'Unlinked Protocol'}
              </span>
              {status.connected && (
                <>
                   <span className="w-1 h-1 bg-border rounded-full" />
                   <p className="text-xs text-muted-foreground font-medium">Syncing internal knowledge base context.</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {status.connected ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {status.documentsCount > 0 && (
              <div className="px-5 py-2 rounded-full bg-primary/5 border border-primary/10 shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {status.documentsCount} Context Points Indexed
                </span>
              </div>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-full px-10 h-14 bg-emphasis text-emphasis-fg hover:bg-primary font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl disabled:opacity-50 flex items-center gap-3 active:scale-95"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
              {syncing ? 'Syncing...' : 'Initiate Sync'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-full px-10 h-14 bg-emphasis text-emphasis-fg hover:bg-primary font-bold text-[10px] uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 active:scale-95"
          >
            {connecting ? 'Connecting...' : 'Establish Connection'}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {status.connected && (
        <div className="pt-8 border-t border-border/40 space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Share2 className="h-4 w-4 text-muted-foreground/40" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Latest Ingested Context</h4>
             </div>
             {status.lastSync && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                  Last Update: {new Date(status.lastSync).toLocaleDateString()}
                </p>
              )}
          </div>

          <div className="flex flex-wrap gap-3">
            {status.documents?.slice(0, 5).map((doc: any) => (
              <a
                key={doc.id}
                href={doc.metadata?.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 bg-card border border-border/60 rounded-full text-xs font-medium hover:border-primary/40 hover:shadow-lg transition-all active:scale-95"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {doc.title}
                <ExternalLink className="h-3 w-3 text-muted-foreground/40" />
              </a>
            ))}
            {status.documentsCount > 5 && (
              <div className="px-5 py-2.5 bg-muted/20 border border-transparent rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center">
                 +{status.documentsCount - 5} More
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

