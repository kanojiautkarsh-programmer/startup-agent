'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Activity,
  FileText,
  MessageSquare,
  Target,
  Zap
} from 'lucide-react';

interface AnalyticsSummary {
  totalEvents: number;
  totalSessions: number;
  totalDuration: number;
  eventBreakdown: Record<string, number>;
  topPages: Record<string, number>;
  featureUsage: Array<{
    feature_name: string;
    usage_count: number;
    usage_date: string;
  }>;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  events: Array<{
    event_type: string;
    event_data: Record<string, any>;
    created_at: string;
    page_path: string;
  }>;
}

const EVENT_ICONS: Record<string, any> = {
  page_view: Activity,
  feature_used: Zap,
  ai_chat: MessageSquare,
  document_uploaded: FileText,
  goal_created: Target,
  goal_completed: Target,
  session_start: Clock,
  session_end: Clock,
};

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Page Views',
  feature_used: 'Feature Used',
  ai_chat: 'AI Chat',
  document_uploaded: 'Documents',
  goal_created: 'Goals Created',
  goal_completed: 'Goals Completed',
  integration_connected: 'Integrations',
  session_start: 'Sessions',
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/track?period=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const topEvents = data?.summary.eventBreakdown 
    ? Object.entries(data.summary.eventBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  const topPages = data?.summary.topPages
    ? Object.entries(data.summary.topPages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  const topFeatures = data?.summary.featureUsage
    ?.sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, 5) || [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-20 bg-muted rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Activity</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                period === p 
                  ? 'bg-black text-white' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Events"
          value={data?.summary.totalEvents || 0}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Sessions"
          value={data?.summary.totalSessions || 0}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Time Spent"
          value={formatDuration(data?.summary.totalDuration || 0)}
          color="purple"
        />
        <StatCard
          icon={MessageSquare}
          label="AI Chats"
          value={data?.summary.eventBreakdown?.ai_chat || 0}
          color="orange"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Event Breakdown
          </h3>
          <div className="space-y-3">
            {topEvents.length > 0 ? (
              topEvents.map(([type, count]) => {
                const Icon = EVENT_ICONS[type] || Activity;
                const maxCount = Math.max(...topEvents.map(([, c]) => c));
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={type} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm truncate">
                          {EVENT_LABELS[type] || type}
                        </span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-black rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No events yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Top Pages
          </h3>
          <div className="space-y-3">
            {topPages.length > 0 ? (
              topPages.map(([page, count]) => (
                <div key={page} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{page || '/'}</span>
                  <span className="text-sm font-medium ml-4">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No page views yet</p>
            )}
          </div>
        </div>
      </div>

      {topFeatures.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Most Used Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {topFeatures.map((feature, i) => (
              <div 
                key={feature.feature_name}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
              >
                <span className="text-sm font-medium">#{i + 1}</span>
                <span className="text-sm">{feature.feature_name}</span>
                <span className="text-xs text-muted-foreground">
                  {feature.usage_count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number | string; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

