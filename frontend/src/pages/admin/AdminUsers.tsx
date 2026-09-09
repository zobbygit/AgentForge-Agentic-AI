import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Power, Shield, User, Settings, X } from 'lucide-react'; // placeholder avoided — see below
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
    const [quotaModal, setQuotaModal] = useState<any>(null);
  const [newQuota, setNewQuota] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) p.append('search', search);
      const { data } = await api.get(`/admin/users?${p}`);
      return data.data;
    },
  });

  const toggleUser = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/toggle`),
    onSuccess: () => { toast.success('User status updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast.error('Failed to update user'),
  });
  const updateQuota = useMutation({
    mutationFn: ({ id, dailyTaskLimit }: { id: string; dailyTaskLimit: number }) =>
      api.put(`/admin/users/${id}/quota`, { dailyTaskLimit }),
    onSuccess: () => {
      toast.success('Quota updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setQuotaModal(null);
    },
    onError: () => toast.error('Failed to update quota'),
  });
  const users = data?.users || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} total users</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..." className="forge-input pl-9 text-sm py-2.5" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="forge-card h-16 animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <Users size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No users found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {users.map((u: any) => (
            <div key={u._id} className="forge-card-hover px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-indigo-500/15 rounded-full flex items-center justify-center text-indigo-300 text-sm font-bold flex-shrink-0">
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200">{u.name}</p>
                  {u.role === 'ADMIN' && (
                    <span className="flex items-center gap-1 text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">
                      <Shield size={10} /> Admin
                    </span>
                  )}
                  {!u.isActive && (
                    <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Deactivated</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
                   <div className="text-right text-xs text-slate-500 flex-shrink-0">
                <p>Joined {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</p>
                <p className="text-indigo-400">{u.dailyTaskCount || 0}/{u.dailyTaskLimit || 20} tasks today</p>
              </div>
                    <button
                onClick={() => { setQuotaModal(u); setNewQuota(u.dailyTaskLimit || 20); }}
                className="p-2 rounded-lg transition-all flex-shrink-0 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                title="Adjust quota"
              >
                <Settings size={15} />
              </button>
              <button
                onClick={() => { if (confirm(`${u.isActive ? 'Deactivate' : 'Activate'} this user?`)) toggleUser.mutate(u._id); }}
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${u.isActive ? 'text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-green-500/10 hover:text-green-400'}`}
                title={u.isActive ? 'Deactivate' : 'Activate'}
              >
                <Power size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
   {/* Quota adjustment modal */}
      {quotaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setQuotaModal(null)}>
          <div className="forge-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white">Adjust Daily Quota</h3>
              <button onClick={() => setQuotaModal(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">{quotaModal.name} ({quotaModal.email})</p>
            <label className="text-xs text-slate-400 mb-2 block">Daily task limit</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={newQuota}
              onChange={e => setNewQuota(Number(e.target.value))}
              className="forge-input text-sm mb-4"
            />
            <div className="flex gap-2 mb-4">
              {[10, 20, 50, 100].map(preset => (
                <button
                  key={preset}
                  onClick={() => setNewQuota(preset)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                    newQuota === preset
                      ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <button
              onClick={() => updateQuota.mutate({ id: quotaModal._id, dailyTaskLimit: newQuota })}
              disabled={updateQuota.isPending || newQuota < 1}
              className="forge-btn-primary w-full text-sm"
            >
              {updateQuota.isPending ? 'Saving...' : 'Save Quota'}
            </button>
          </div>
        </div>
      )}
      {data?.total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-sm text-slate-400">Page {page}</span>
          <button disabled={users.length < 20} onClick={() => setPage(p => p + 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
