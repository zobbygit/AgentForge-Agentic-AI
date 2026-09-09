import { useQuery } from '@tanstack/react-query';
import { Cpu, Zap, Brain, Code2, Globe, Database, Activity, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';

const CATEGORY_META: Record<string, { color: string; icon: any; label: string }> = {
  GENERAL:      { color: 'text-indigo-400', icon: Cpu,      label: 'General Purpose' },
  REASONING:    { color: 'text-violet-400', icon: Brain,    label: 'Deep Reasoning' },
  CODING:       { color: 'text-cyan-400',   icon: Code2,    label: 'Code & Dev' },
  FAST:         { color: 'text-green-400',  icon: Zap,      label: 'Fast / Lightweight' },
  LONG_CONTEXT: { color: 'text-amber-400',  icon: Database, label: 'Long Context' },
  MULTIMODAL:   { color: 'text-pink-400',   icon: Globe,    label: 'Multimodal' },
};

const healthColor = (rate: number) => {
  if (rate >= 90) return 'text-green-400';
  if (rate >= 70) return 'text-amber-400';
  return 'text-red-400';
};

const healthBg = (rate: number) => {
  if (rate >= 90) return 'bg-green-500/10 border-green-500/20';
  if (rate >= 70) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
};

// Tiny inline sparkline from recent latencies
function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return <div className="h-6 text-xs text-slate-600 flex items-center">No data</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 24 - ((v - min) / range) * 24;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 24" className="w-full h-6" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400" />
    </svg>
  );
}

export default function ModelsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['model-health'],
    queryFn: async () => { const { data } = await api.get('/models/health'); return data.data; },
    refetchInterval: 20000,
  });

  const models = data?.health || [];
  const summary = data?.summary;

  const grouped = models.reduce((acc: Record<string, any[]>, m: any) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">AI Model Health</h1>
        <p className="text-slate-400 text-sm mt-0.5">Live observability across your free OpenRouter model pool</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Active Models', value: summary.activeModels, icon: Cpu, color: 'text-indigo-400' },
            { label: 'Total Calls', value: summary.totalUsage, icon: Activity, color: 'text-cyan-400' },
            { label: 'Errors', value: summary.totalErrors, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Fallbacks', value: summary.totalFallbacks, icon: TrendingUp, color: 'text-amber-400' },
            { label: 'Success Rate', value: `${summary.overallSuccessRate}%`, icon: CheckCircle2, color: healthColor(summary.overallSuccessRate) },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="forge-card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{label}</p>
                <Icon size={14} className={color} />
              </div>
              <p className={`font-display text-2xl font-bold ${color}`}>{isLoading ? '—' : value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="forge-card p-5 mb-6 border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-start gap-3">
          <Zap size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-200">Dynamic Model Discovery</p>
            <p className="text-sm text-slate-400 mt-1">
              Models are auto-discovered from OpenRouter's live catalog every 10 minutes. Uptime and latency
              are tracked per model in real time — models that fail repeatedly are automatically disabled.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="forge-card h-32 animate-pulse" />)}</div>
      ) : models.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <Cpu size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No models discovered yet. Check your OpenRouter API key.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryModels]) => {
            const meta = CATEGORY_META[category] || { color: 'text-slate-400', icon: Cpu, label: category };
            const Icon = meta.icon;
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className={meta.color} />
                  <h2 className="font-display font-semibold text-white text-sm">{meta.label}</h2>
                  <span className="text-xs text-slate-500">({(categoryModels as any[]).length})</span>
                </div>
                <div className="space-y-3">
                  {(categoryModels as any[]).map((m: any) => (
                    <div key={m._id} className={`forge-card p-4 border ${m.isEnabled && m.isAvailable ? 'border-white/[0.08]' : 'border-red-500/20 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-slate-200">{m.name}</p>
                            <span className={`status-badge text-xs border ${
                              m.isEnabled && m.isAvailable
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {m.isEnabled && m.isAvailable ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono">{m.modelId}</p>
                        </div>
                        <div className={`text-right px-3 py-1.5 rounded-lg border ${healthBg(m.uptime24h)}`}>
                          <p className={`text-lg font-bold font-display ${healthColor(m.uptime24h)}`}>{m.uptime24h}%</p>
                          <p className="text-xs text-slate-500">24h uptime</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
                        <div>
                          <p className="text-slate-500">Success Rate</p>
                          <p className={`font-medium ${healthColor(m.successRate)}`}>{m.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Avg Latency</p>
                          <p className="text-slate-300 font-medium">{m.avgLatencyMs ? `${m.avgLatencyMs}ms` : '—'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Total Calls</p>
                          <p className="text-slate-300 font-medium">{m.usageCount}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Fallbacks</p>
                          <p className="text-slate-300 font-medium">{m.fallbackCount}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">Latency trend (last {m.recentLatencies?.length || 0} calls)</p>
                        <Sparkline data={m.recentLatencies} />
                      </div>

                      {m.lastSuccessAt && (
                        <p className="text-xs text-slate-600 mt-2">
                          Last success: {formatDistanceToNow(new Date(m.lastSuccessAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}