'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Loader2
} from 'lucide-react';
import { ZERO_TRAINING_PRINCIPLES, EXCLUDED_PURPOSES, CONSENT_VERSION } from '@/lib/security/zero-data-training';

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
      
      const userPassword = prompt('Set a password to protect your encryption key (you will need this to recover your key):');
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
      console.error('Failed to enable E2EE:', error);
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
        body: JSON.stringify({
          action: 'check',
        }),
      });

      if (res.ok) {
        setKeyFingerprint(fingerprint);
      }
    } catch (error) {
      console.error('Failed to rotate key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportKey = async () => {
    try {
      const { exportUserKey } = await import('@/lib/security/client-encryption');
      const userPassword = prompt('Enter your password to export the key:');
      if (userPassword) {
        const exportedKey = await exportUserKey(userPassword);
        const blob = new Blob([exportedKey], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'e2ee-backup.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export key:', error);
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
        body: JSON.stringify({
          optedOut: !dataTrainingOptOut,
        }),
      });

      if (res.ok) {
        setDataTrainingOptOut(!dataTrainingOptOut);
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
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
      console.error('Failed to export data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit/logs?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
        },
      });

      if (res.ok) {
        const { logs } = await res.json();
        setAuditLogs(logs);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSsoProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sso/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token') || ''}`,
        },
      });

      if (res.ok) {
        const { providers } = await res.json();
        setSsoProviders(providers);
      }
    } catch (error) {
      console.error('Failed to fetch SSO providers:', error);
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
        const { message } = await res.json();
        alert(message);
        setSsoConfig({ name: '', issuer: '', clientId: '', clientSecret: '', ssoUrl: '' });
        setSsoProvider(null);
        fetchSsoProviders();
      } else {
        const { error } = await res.json();
        alert(error || 'Failed to add SSO provider');
      }
    } catch (error) {
      console.error('Failed to add SSO provider:', error);
      alert('Failed to add SSO provider');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'encryption', label: 'Encryption', icon: Lock },
    { id: 'sso', label: 'SSO / SAML', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: Clock },
    { id: 'compliance', label: 'Compliance', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
        <p className="text-muted-foreground">
          Manage your security settings, encryption, and compliance preferences.
        </p>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'audit' && auditLogs.length === 0) {
                fetchAuditLogs();
              }
              if (tab.id === 'sso' && ssoProviders.length === 0) {
                fetchSsoProviders();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'encryption' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>End-to-End Encryption</CardTitle>
              </div>
              <CardDescription>
                Encrypt your sensitive data with your own encryption key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">E2EE Status</label>
                  <p className="text-sm text-muted-foreground">
                    {e2eeEnabled ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Enabled
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" /> Not Enabled
                      </span>
                    )}
                  </p>
                </div>
                <Button 
                  variant={e2eeEnabled ? "secondary" : "default"}
                  onClick={handleEnableE2EE}
                  disabled={loading || e2eeEnabled}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {e2eeEnabled ? 'Enabled' : 'Enable E2EE'}
                </Button>
              </div>

              {e2eeEnabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key Fingerprint</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
                        {keyFingerprint || 'Loading...'}
                      </code>
                      <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRotateKey} disabled={loading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rotate Key
                    </Button>
                    <Button variant="outline" onClick={handleExportKey}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Backup
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                <CardTitle>API Key Encryption</CardTitle>
              </div>
              <CardDescription>
                Your API keys are encrypted at rest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">All API keys are encrypted using AES-256-GCM</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'sso' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Single Sign-On (SSO)</CardTitle>
              </div>
              <CardDescription>
                Configure SAML or OIDC-based single sign-on for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ssoProviders.length > 0 && (
                <div className="mb-4 p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Configured Providers</h4>
                  <div className="space-y-2">
                    {ssoProviders.map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={p.enabled ? 'default' : 'secondary'}>
                            {p.provider.toUpperCase()}
                          </Badge>
                          <span>{p.name}</span>
                        </div>
                        <Badge variant={p.enabled ? 'default' : 'outline'}>
                          {p.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mb-4">
                <Button 
                  variant={ssoProvider === 'saml' ? 'default' : 'outline'}
                  onClick={() => setSsoProvider('saml')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  SAML 2.0
                </Button>
                <Button 
                  variant={ssoProvider === 'oidc' ? 'default' : 'outline'}
                  onClick={() => setSsoProvider('oidc')}
                >
                  <Key className="h-4 w-4 mr-2" />
                  OIDC
                </Button>
              </div>

              {ssoProvider && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Provider Name</label>
                      <Input 
                        placeholder="e.g., Okta, Azure AD"
                        value={ssoConfig.name}
                        onChange={(e) => setSsoConfig({ ...ssoConfig, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Issuer / Entity ID</label>
                      <Input 
                        placeholder="https://your-idp.com"
                        value={ssoConfig.issuer}
                        onChange={(e) => setSsoConfig({ ...ssoConfig, issuer: e.target.value })}
                      />
                    </div>
                    {ssoProvider === 'saml' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">SSO URL</label>
                        <Input 
                          placeholder="https://your-idp.com/sso"
                          value={ssoConfig.ssoUrl}
                          onChange={(e) => setSsoConfig({ ...ssoConfig, ssoUrl: e.target.value })}
                        />
                      </div>
                    )}
                    {ssoProvider === 'oidc' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Client ID</label>
                          <Input 
                            placeholder="Your OAuth client ID"
                            value={ssoConfig.clientId}
                            onChange={(e) => setSsoConfig({ ...ssoConfig, clientId: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Client Secret</label>
                          <Input 
                            type="password"
                            placeholder="Your OAuth client secret"
                            value={ssoConfig.clientSecret}
                            onChange={(e) => setSsoConfig({ ...ssoConfig, clientSecret: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddSSOProvider}
                      disabled={loading || !ssoConfig.name || !ssoConfig.issuer || (ssoProvider === 'saml' && !ssoConfig.ssoUrl) || (ssoProvider === 'oidc' && (!ssoConfig.clientId || !ssoConfig.clientSecret))}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Add Provider
                    </Button>
                  </div>
                </div>
              )}

              {!ssoProvider && (
                <p className="text-sm text-muted-foreground">
                  Select SAML 2.0 or OIDC above to configure your identity provider.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Activity Log</CardTitle>
              </div>
              <CardDescription>
                View your recent account activity and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</span>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                            {log.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()} • {log.resource_type}
                        </p>
                      </div>
                      {log.ip_address && (
                        <code className="text-xs text-muted-foreground">{log.ip_address}</code>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity to display</p>
                  <Button variant="link" onClick={fetchAuditLogs} className="mt-2">
                    Refresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zero Data Training Policy</CardTitle>
              <CardDescription>
                Your data will never be used to train AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Data Training Opt-Out</label>
                  <p className="text-sm text-muted-foreground">
                    Opt out of any potential data usage for AI training
                  </p>
                </div>
                <Button 
                  variant={dataTrainingOptOut ? "secondary" : "default"}
                  onClick={handleConsentToggle}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {dataTrainingOptOut ? 'Opted Out' : 'Opt Out'}
                </Button>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold text-sm">Your Data Rights</h4>
                {Object.values(ZERO_TRAINING_PRINCIPLES).map((principle) => (
                  <div key={principle.id} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{principle.title}</span>
                      <p className="text-sm text-muted-foreground">{principle.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-semibold text-sm mb-2">Excluded Purposes</h4>
                <div className="flex flex-wrap gap-2">
                  {EXCLUDED_PURPOSES.map((purpose) => (
                    <Badge key={purpose.id} variant="secondary">
                      {purpose.purpose}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Consent version {CONSENT_VERSION} accepted</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>
                How long we keep your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Messages', days: 365 },
                  { label: 'Conversations', days: 730 },
                  { label: 'Memories', days: 1095 },
                  { label: 'Audit Logs', days: 2555 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.days} days ({Math.round(item.days / 365)} years)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>
                Download a copy of all your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportData} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Request Data Export
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                You will receive a downloadable JSON file containing all your data
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
