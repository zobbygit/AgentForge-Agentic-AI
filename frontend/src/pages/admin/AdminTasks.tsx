import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  RUNNING:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  PLANNING:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  FAILED:    'bg-red-500/10 text-red-400 border-red-500/20',
  PENDING:   'bg-slate-500/10 text-slate-400 border-slate-500/20',
  CANCELLED: 'bg-slate-600/10 text-slate-500 border-slate-600/20',
  APPROVAL_REQUIRED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function AdminTasks() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tasks', statusFilter, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) p.append('status', statusFilter);
      const { data } = await api.get(`/admin/tasks?${p}`);
      return data.data;
    },
    refetchInterval: 15000,
  });

  const tasks = data?.tasks || [];
  const STATUSES = ['', 'PENDING', 'PLANNING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'APPROVAL_REQUIRED'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">All Tasks</h1>
        <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} total tasks across all users</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`text-xs px-3 py-2 rounded-lg border transition-all ${statusFilter === s
              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="forge-card h-16 animate-pulse" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <Zap size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((t: any) => (
            <div key={t._id} className="forge-card-hover px-4 py-3.5 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                t.status === 'COMPLETED' ? 'bg-green-400' :
                ['RUNNING','PLANNING'].includes(t.status) ? 'bg-cyan-400 animate-pulse' :
                t.status === 'FAILED' ? 'bg-red-400' : 'bg-slate-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                  <span className={`status-badge border text-xs flex-shrink-0 ${statusColors[t.status] || statusColors.PENDING}`}>
                    {t.status.replace(/_/g,' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-slate-500 truncate flex-1">{t.goal?.substring(0, 80)}</p>
                  {t.userId && (
                    <p className="text-xs text-slate-600 flex-shrink-0">
                      by {t.userId.name || 'User'}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-slate-600 flex-shrink-0">
                <p>{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</p>
                {t.actualDuration && <p className="text-slate-700">{Math.round(t.actualDuration / 1000)}s</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-sm text-slate-400">Page {page}</span>
          <button disabled={tasks.length < 20} onClick={() => setPage(p => p + 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
