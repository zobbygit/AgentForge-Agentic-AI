import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

const statusColors: Record<string, string> = {
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  failure: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const actorColors: Record<string, string> = {
  user:   'text-cyan-400',
  agent:  'text-violet-400',
  system: 'text-slate-400',
  admin:  'text-amber-400',
};

export default function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', search, statusFilter, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: '30' });
      if (search) p.append('action', search);
      if (statusFilter) p.append('status', statusFilter);
      const { data } = await api.get(`/admin/audit-logs?${p}`);
      return data.data;
    },
  });

  const logs = data?.logs || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} log entries (90-day retention)</p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filter by action..." className="forge-input pl-9 text-sm py-2.5" />
        </div>
        <div className="flex gap-2">
          {['', 'success', 'failure', 'pending'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${statusFilter === s
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(8)].map((_,i)=><div key={i} className="forge-card h-12 animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <FileText size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No audit logs found</p>
        </div>
      ) : (
        <div className="forge-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Timestamp', 'Actor', 'Action', 'Resource', 'User', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {logs.map((log: any) => (
                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                    {format(new Date(log.timestamp), 'MM/dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium capitalize ${actorColors[log.actorType] || 'text-slate-400'}`}>
                      {log.actorType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{log.action}</td>
                  <td className="px-4 py-3 text-slate-500">{log.resourceType}</td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[120px]">
                    {log.userId?.name || log.userId?.email || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge border text-xs ${statusColors[log.status] || statusColors.pending}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.total > 30 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-sm text-slate-400">Page {page}</span>
          <button disabled={logs.length < 30} onClick={() => setPage(p => p + 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
