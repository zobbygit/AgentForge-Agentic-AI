import { useQuery } from '@tanstack/react-query';
import { Users, Zap, CheckCircle2, XCircle, Archive, Calendar, BarChart3, Cpu, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => { const { data } = await api.get('/admin/dashboard'); return data.data; },
    refetchInterval: 30000,
  });

  const stats = data?.stats;
  const recentUsers = data?.recentUsers || [];
  const recentLogs = data?.recentAuditLogs || [];

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Active Users', value: stats?.activeUsers, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Tasks', value: stats?.totalTasks, icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Running Now', value: stats?.runningTasks, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Completed', value: stats?.completedTasks, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Failed', value: stats?.failedTasks, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Artifacts', value: stats?.totalArtifacts, icon: Archive, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Active Schedules', value: stats?.scheduledTasks, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Platform overview and system health</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="forge-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500">{label}</p>
              <div className={`${bg} p-1.5 rounded-lg`}><Icon size={13} className={color} /></div>
            </div>
            <p className={`font-display text-2xl font-bold ${color}`}>
              {isLoading ? <span className="animate-pulse">—</span> : (value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Success rate banner */}
      {stats && (
        <div className="forge-card p-5 mb-6 flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-1">Overall Success Rate</p>
            <p className="font-display text-3xl font-bold text-green-400">{stats.successRate}%</p>
          </div>
          <div className="flex-1">
            <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${stats.successRate}%` }} />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Model Fallbacks</p>
            <p className="font-display text-2xl font-bold text-amber-400">{stats.modelFallbacks}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div>
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={15} className="text-indigo-400" /> Recent Users
          </h2>
          <div className="space-y-2.5">
            {recentUsers.map((u: any) => (
              <div key={u._id} className="forge-card px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {u.role}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit logs */}
        <div>
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={15} className="text-indigo-400" /> Recent Activity
          </h2>
          <div className="space-y-2">
            {recentLogs.map((log: any) => (
              <div key={log._id} className="forge-card px-4 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-green-400' : log.status === 'failure' ? 'bg-red-400' : 'bg-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.actorType} · {log.resourceType}</p>
                </div>
                <p className="text-xs text-slate-600 flex-shrink-0">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
