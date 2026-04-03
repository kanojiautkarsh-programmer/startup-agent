'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Download, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Fingerprint,
  Database,
  Search,
  ExternalLink,
  History
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { ZERO_TRAINING_PRINCIPLES, EXCLUDED_PURPOSES, CONSENT_VERSION } from '@/lib/security/zero-data-training';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface AuditLog {
  id: string;
  action: string;
  event_type: string;
  status: string;
  created_at: string;
  ip_address?: string;
  resource_type: string;
}

export function SecuritySettings() {
  const router = useRouter();
  const [e2eeEnabled, setE2eeEnabled] = useState(false);
  const [keyFingerprint, setKeyFingerprint] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [dataTrainingOptOut, setDataTrainingOptOut] = useState(true);
  const [activeTab, setActiveTab] = useState('encryption');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [ssoProvider, setSsoProvider] = useState<'saml' | 'oidc' | null>(null);
  const [ssoConfig, setSsoConfig] = useState({
    name: '',
    issuer: '',
    clientId: '',
    clientSecret: '',
    ssoUrl: '',
  });
  const [ssoProviders, setSsoProviders] = useState<{id: string; name: string; provider: string; enabled: boolean}[]>([]);

  const handleEnableE2EE = async () => {
    try {
      setLoading(true);
      const { initializeClientEncryption, getKeyFingerprint, exportUserKey } = await import('@/lib/security/client-encryption');
      await initializeClientEncryption();
      const fingerprint = await getKeyFingerprint();
      
      const userPassword = prompt('Establish a secure decryption phrase (Required for key recovery):');
      if (!userPassword) {
        setLoading(false);
        return;
      }
      
      const exportedKey = await exportUserKey(userPassword);
      const parsed = JSON.parse(exportedKey);
      
      const res = await fetch('/api/encryption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
        },
        body: JSON.stringify({
          action: 'store',
          encryptedKey: parsed.ciphertext,
          salt: parsed.salt,
          keyFingerprint: fingerprint,
        }),
      });

      if (res.ok) {
        setKeyFingerprint(fingerprint);
        setE2eeEnabled(true);
      }
    } catch (error) {
      console.error('Core encryption failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async () => {
    try {
      setLoading(true);
      const { getKeyFingerprint } = await import('@/lib/security/client-encryption');
      const fingerprint = await getKeyFingerprint();
      
      const res = await fetch('/api/encryption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
        },
        body: JSON.stringify({ action: 'check' }),
      });

      if (res.ok) {
        setKeyFingerprint(fingerprint);
      }
    } catch (error) {
      console.error('Key rotation failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportKey = async () => {
    try {
      const { exportUserKey } = await import('@/lib/security/client-encryption');
      const userPassword = prompt('Enter protocol password to authorize export:');
      if (userPassword) {
        const exportedKey = await exportUserKey(userPassword);
        const blob = new Blob([exportedKey], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasklyne-e2ee-vault-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failure:', error);
    }
  };

  const handleConsentToggle = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
        },
        body: JSON.stringify({ optedOut: !dataTrainingOptOut }),
      });

      if (res.ok) {
        setDataTrainingOptOut(!dataTrainingOptOut);
      }
    } catch (error) {
      console.error('Consent update failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
        },
      });

      if (res.ok) {
        const { data, filename } = await res.json();
        const blob = new Blob([atob(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Data export failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit/logs?limit=20', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}` },
      });

      if (res.ok) {
        const { logs } = await res.json();
        setAuditLogs(logs);
      }
    } catch (error) {
      console.error('Audit retrieval failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSsoProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sso/providers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}` },
      });

      if (res.ok) {
        const { providers } = await res.json();
        setSsoProviders(providers);
      }
    } catch (error) {
      console.error('SSO retrieval failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSSOProvider = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sso/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
        },
        body: JSON.stringify({
          name: ssoConfig.name,
          provider: ssoProvider,
          issuer: ssoConfig.issuer,
          ssoUrl: ssoConfig.ssoUrl,
          clientId: ssoConfig.clientId,
          clientSecret: ssoConfig.clientSecret,
        }),
      });

      if (res.ok) {
        setSsoConfig({ name: '', issuer: '', clientId: '', clientSecret: '', ssoUrl: '' });
        setSsoProvider(null);
        fetchSsoProviders();
      }
    } catch (error) {
      console.error('SSO establishment failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'encryption', label: 'Protocol Encryption', icon: Lock },
    { id: 'sso', label: 'Identity / SSO', icon: ShieldCheck },
    { id: 'audit', label: 'Tactical Logs', icon: Clock },
    { id: 'compliance', label: 'Compliance', icon: FileText },
  ];

  useEffect(() => {
    if (activeTab === 'audit' && auditLogs.length === 0) fetchAuditLogs();
    if (activeTab === 'sso' && ssoProviders.length === 0) fetchSsoProviders();
  }, [activeTab]);

  return (
    <div className="space-y-12 animate-slide-up">
      <div className="mb-16">
        <h1 className="text-5xl md:text-6xl font-serif text-foreground font-medium tracking-tight mb-4">
          Integrity <span className="italic font-normal text-muted-foreground/60">& Shield</span>
        </h1>
        <div className="flex items-center gap-3">
           <span className="w-1.5 h-4 bg-primary rounded-full" />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Security level: Maximum reinforcement</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-12 border-b border-border/40 pb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
               "flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-full border",
               activeTab === tab.id
                ? 'bg-foreground text-background border-transparent shadow-xl'
                : 'bg-white text-muted-foreground/60 border-border/60 hover:border-primary/40 hover:text-foreground'
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-white" : "text-muted-foreground/40")} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'encryption' && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl group relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-foreground shadow-2xl flex items-center justify-center text-background group-hover:scale-110 transition-transform duration-500">
                         <Lock className="h-8 w-8" />
                      </div>
                      <div>
                         <h2 className="text-3xl font-serif font-medium tracking-tight">End-to-End Vault</h2>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Client-side encryption protocol</p>
                      </div>
                   </div>
                   <div className={cn(
                       "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                       e2eeEnabled ? "bg-green-500/5 text-green-600 border-green-600/20" : "bg-orange-500/5 text-orange-600 border-orange-600/20"
                   )}>
                      {e2eeEnabled ? "Active" : "Protected"}
                   </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                       <p className="text-sm text-foreground/80 leading-relaxed max-w-md">
                          TaskLyne utilizes industrial-grade AES-256-GCM encryption. By enabling E2EE, your data is encrypted before it ever leaves your machine. 
                       </p>
                       <ul className="space-y-3">
                          {[
                             "Zero-knowledge architecture",
                             "Personal recovery vault generation",
                             "Atomic key rotation supported"
                          ].map(feature => (
                             <li key={feature} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                {feature}
                             </li>
                          ))}
                       </ul>
                    </div>

                    <div className="glass-card bg-primary/[0.02] border-primary/10 rounded-[2.5rem] p-8">
                       {e2eeEnabled ? (
                          <div className="space-y-8">
                             <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-2 flex items-center gap-2">
                                   <Fingerprint className="h-3 w-3" /> User Fingerprint
                                </label>
                                <div className="flex gap-3">
                                   <code className="flex-1 rounded-2xl bg-card border border-border/60 px-6 py-4 text-xs font-mono tracking-tight text-foreground/80 truncate">
                                      {keyFingerprint || 'Establishing trace...'}
                                   </code>
                                   <button 
                                      onClick={() => setShowKey(!showKey)}
                                      className="w-14 h-14 rounded-2xl border border-border/60 bg-card flex items-center justify-center hover:bg-foreground hover:text-background transition-all shadow-sm"
                                   >
                                      {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                   </button>
                                </div>
                             </div>

                             <div className="flex gap-4">
                                <button onClick={handleRotateKey} className="flex-1 h-14 rounded-full border border-border/60 bg-white text-[10px] font-bold uppercase tracking-widest hover:border-primary/40 transition-all flex items-center justify-center gap-3">
                                   <RefreshCw className="h-4 w-4" /> Rotate Authority
                                </button>
                                <button onClick={handleExportKey} className="flex-1 h-14 rounded-full bg-[#2D211B] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-xl">
                                   <Download className="h-4 w-4" /> Export Vault
                                </button>
                             </div>
                          </div>
                       ) : (
                          <div className="text-center py-6">
                             <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="h-8 w-8 text-primary animate-pulse" />
                             </div>
                             <h4 className="text-xl font-serif font-medium mb-4">Encryption Standby</h4>
                             <p className="text-sm text-muted-foreground/60 mb-8 mx-auto max-w-[280px]">Your session keys are currently managed by TaskLyne Secure Core.</p>
                             <button 
                                onClick={handleEnableE2EE}
                                disabled={loading}
                                className="w-full h-14 rounded-full bg-[#2D211B] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                             >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Establishing Private Key
                             </button>
                          </div>
                       )}
                    </div>
                </div>
            </div>

            <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl group">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                     <Database className="h-7 w-7" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-serif font-medium tracking-tight">API Transport Layer</h2>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-[#2D211B] mt-1 bg-green-500/10 px-3 py-1 rounded-full inline-block">AES-256-GCM Secure</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'sso' && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl">
               <div className="flex items-center justify-between mb-12 pb-8 border-b border-border/40">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-foreground shadow-2xl flex items-center justify-center text-background">
                        <ShieldCheck className="h-8 w-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-serif font-medium tracking-tight">Identity Hub</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Enterprise SSO / SAML configurations</p>
                     </div>
                  </div>
                  <button className="h-12 px-8 rounded-full border border-border/60 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/[0.02] transition-all">
                     View Auth Logs
                  </button>
               </div>

               <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                     <p className="text-sm text-foreground/80 leading-relaxed mb-6">Connect your organization's identity provider for centralized access control and seamless provisioning.</p>
                     
                     <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-2">Active Gateways</label>
                        {ssoProviders.length > 0 ? (
                           <div className="grid gap-3">
                              {ssoProviders.map((p) => (
                                 <div key={p.id} className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all shadow-sm group">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-[#2D211B]/5 border border-[#2D211B]/10 flex items-center justify-center text-[#2D211B] font-bold text-[10px]">
                                          {p.provider.substring(0, 2).toUpperCase()}
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold tracking-tight">{p.name}</p>
                                          <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/40">{p.provider}</p>
                                       </div>
                                    </div>
                                    <div className={cn(
                                       "w-2 h-2 rounded-full",
                                       p.enabled ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]" : "bg-muted-foreground/30"
                                    )} />
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-8 rounded-[2rem] border border-dashed border-border/60 flex flex-col items-center justify-center text-center">
                              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">No identity providers configured</p>
                           </div>
                        )}
                     </div>

                     <div className="flex gap-4 pt-6">
                        <button 
                           onClick={() => setSsoProvider('saml')} 
                           className={cn(
                              "flex-1 h-16 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                              ssoProvider === 'saml' ? "bg-foreground text-background border-transparent shadow-xl" : "bg-white border-border/60 hover:border-primary/40"
                           )}
                        >
                           Establish SAML 2.0
                        </button>
                        <button 
                           onClick={() => setSsoProvider('oidc')} 
                           className={cn(
                              "flex-1 h-16 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                              ssoProvider === 'oidc' ? "bg-foreground text-background border-transparent shadow-xl" : "bg-white border-border/60 hover:border-primary/40"
                           )}
                        >
                           Establish OIDC
                        </button>
                     </div>
                  </div>

                  <div className="glass-card bg-primary/[0.02] border-primary/10 rounded-[2.5rem] p-10">
                     {ssoProvider ? (
                        <div className="space-y-6 animate-slide-up">
                           <h4 className="text-xl font-serif font-medium mb-6">New {ssoProvider.toUpperCase()} Protocol</h4>
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">Provider ID</label>
                                 <input 
                                    className="w-full h-12 px-6 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/40 transition-all font-medium"
                                    placeholder="e.g. Identity Node 01"
                                    value={ssoConfig.name}
                                    onChange={(e) => setSsoConfig({ ...ssoConfig, name: e.target.value })}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">Issuer URI</label>
                                 <input 
                                    className="w-full h-12 px-6 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:border-primary/40 transition-all font-medium"
                                    placeholder="https://idp.identity.com"
                                    value={ssoConfig.issuer}
                                    onChange={(e) => setSsoConfig({ ...ssoConfig, issuer: e.target.value })}
                                 />
                              </div>
                              <button 
                                 onClick={handleAddSSOProvider}
                                 disabled={loading || !ssoConfig.name}
                                 className="w-full h-14 mt-4 rounded-full bg-[#2D211B] text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-primary transition-all active:scale-95"
                              >
                                 Establish Provider
                              </button>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center py-12 flex flex-col items-center">
                           <Zap className="h-10 w-10 text-muted-foreground/20 mb-6" />
                           <h4 className="text-lg font-serif font-medium mb-2">Awaiting Auth Block</h4>
                           <p className="text-sm text-muted-foreground/40">Select a protocol on the left to begin provisioning.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-foreground shadow-2xl flex items-center justify-center text-background">
                        <Clock className="h-8 w-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-serif font-medium tracking-tight">Tactical Logs</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Real-time account surveillance</p>
                     </div>
                  </div>
                  <button onClick={fetchAuditLogs} className="w-12 h-12 rounded-full border border-border/60 bg-card flex items-center justify-center hover:bg-primary/[0.02] transition-all group">
                     <RefreshCw className={cn("h-5 w-5 text-muted-foreground/60 transition-transform duration-500", loading && "animate-spin")} />
                  </button>
               </div>

               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  {auditLogs.length > 0 ? (
                     auditLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-card border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all group">
                           <div className="flex items-center gap-6">
                              <div className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-110",
                                 log.status === 'success' ? "bg-green-600" : "bg-destructive"
                              )}>
                                 {log.status === 'success' ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                              </div>
                              <div>
                                 <p className="text-sm font-bold tracking-tight mb-1">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                                 <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{log.resource_type}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                              <code className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/60 bg-muted/30 px-3 py-1 rounded-full">
                                 {log.ip_address || 'Internal'}
                              </code>
                              <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:translate-x-1 transition-all" />
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-24 bg-primary/[0.02] rounded-[3rem] border border-dashed border-border/40">
                        <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-6" />
                        <h4 className="text-xl font-serif font-medium mb-2 text-muted-foreground/60">Scouring Data Buffers</h4>
                        <p className="text-sm text-muted-foreground/40">No security events found in active cache.</p>
                     </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-8 animate-slide-up">
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="glass-card border border-border/40 rounded-[3rem] p-10 md:p-12 hover:border-primary/20 transition-all shadow-xl space-y-10 group">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-foreground shadow-2xl flex items-center justify-center text-background group-hover:scale-110 transition-transform duration-500">
                        <Shield className="h-8 w-8" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-serif font-medium tracking-tight">Model Safety</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">Zero data training protocol</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <p className="text-sm text-foreground/80 leading-relaxed">TaskLyne enforces a strict zero-data policy. Your organizational intelligence remains exclusive to your instance and is never used for training foundation models.</p>
                     <div className="p-8 rounded-[2rem] bg-card border border-border/60 hover:border-primary/40 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                           <div className="space-y-1">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#2D211B]">Training Opt-Out</h4>
                              <p className="text-[11px] text-muted-foreground/60">Global exclusion for all sub-nodes</p>
                           </div>
                           <button 
                              onClick={handleConsentToggle}
                              disabled={loading}
                              className={cn(
                                 "px-6 h-10 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                                 dataTrainingOptOut ? "bg-green-500/10 text-green-600 border border-green-600/20" : "bg-[#2D211B] text-white"
                              )}
                           >
                              {dataTrainingOptOut ? "Protocol Active" : "Activate Shield"}
                           </button>
                        </div>
                        <div className="space-y-3">
                           {Object.values(ZERO_TRAINING_PRINCIPLES).slice(0, 3).map(p => (
                              <div key={p.id} className="flex items-start gap-3">
                                 <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                                 <span className="text-[11px] font-medium text-foreground/70">{p.title}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="glass-card border border-border/40 rounded-[3rem] p-10 hover:border-primary/20 transition-all shadow-xl">
                     <div className="flex items-center gap-6 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-card border border-border shadow-xl flex items-center justify-center text-primary">
                           <History className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-serif font-medium tracking-tight">Persistence Rules</h2>
                     </div>
                     <div className="grid gap-4">
                        {[
                           { label: 'Intelligence Fragments', days: 365 },
                           { label: 'Executive Sessions', days: 730 },
                           { label: 'Security Buffer', days: 2555 },
                        ].map((item) => (
                           <div key={item.label} className="flex items-center justify-between p-4 rounded-xl hover:bg-primary/[0.02] transition-colors border-b border-border/20 last:border-0 group">
                              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors">{item.label}</span>
                              <span className="text-[11px] font-mono font-bold text-primary">
                                 {item.days} D
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="glass-card border border-border/40 rounded-[3rem] p-10 hover:border-primary/20 transition-all shadow-xl bg-[#2D211B] group overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                     <div className="flex items-center gap-6 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                           <Download className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-serif font-medium tracking-tight text-white">Data Export</h2>
                     </div>
                     <p className="text-sm text-white/60 mb-10 leading-relaxed">Request a full structural export of all entity intelligence and protocol configurations in JSON format.</p>
                     <button 
                        onClick={handleExportData}
                        disabled={loading}
                        className="w-full h-14 rounded-full bg-card text-foreground text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Execute Intelligence Export
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

