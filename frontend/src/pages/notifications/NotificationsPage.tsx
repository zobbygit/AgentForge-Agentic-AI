import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, CheckCircle2, XCircle,
  AlertTriangle, Info, Zap, Clock, Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  TASK_COMPLETED:     { icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
  TASK_FAILED:        { icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20' },
  APPROVAL_REQUIRED:  { icon: AlertTriangle,color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  ARTIFACT_GENERATED: { icon: Zap,          color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  SCHEDULE_COMPLETED: { icon: Clock,        color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  AGENT_INPUT_REQUIRED:{ icon: AlertTriangle,color:'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  MODEL_FALLBACK:     { icon: Info,         color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
  SYSTEM:             { icon: Info,         color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20' },
};

const FILTER_OPTIONS = ['ALL', 'UNREAD', 'TASK_COMPLETED', 'TASK_FAILED', 'APPROVAL_REQUIRED', 'ARTIFACT_GENERATED'];

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', filter, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (filter === 'UNREAD') p.append('unreadOnly', 'true');
      const { data } = await api.get(`/notifications?${p}`);
      return data.data;
    },
    refetchInterval: 15000,
  });

  const markAll = useMutation({
    mutationFn: () => api.post('/notifications/read', {}),
    onSuccess: () => {
      toast.success('All marked as read');
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOne = useMutation({
    mutationFn: (id: string) => api.post('/notifications/read', { ids: [id] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const deleteOne = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      toast.success('Notification deleted');
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const notifications = (data?.notifications || []).filter((n: any) =>
    filter === 'ALL' || filter === 'UNREAD' ? true : n.type === filter
  );
  const unreadCount = data?.unreadCount ?? 0;
  const totalPages = Math.ceil((data?.total ?? 0) / LIMIT);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={22} className="text-indigo-400" />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="forge-btn-secondary text-sm py-2 px-4 flex items-center gap-2 flex-shrink-0"
          >
            <CheckCheck size={15} />
            {markAll.isPending ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`text-xs px-3 py-2 rounded-lg border transition-all flex-shrink-0 ${
              filter === f
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'UNREAD' ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="forge-card h-20 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <Bell size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-1">No notifications</p>
          <p className="text-slate-500 text-sm">
            {filter !== 'ALL' ? 'Try switching to "All"' : 'Notifications will appear here as your agents run'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2.5">
            {notifications.map((n: any) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.SYSTEM;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`forge-card p-4 flex items-start gap-4 border transition-all ${
                    !n.isRead ? `${cfg.border} ${cfg.bg}` : 'border-white/[0.06]'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                    <Icon size={16} className={cfg.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-slate-600 mt-2">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => markOne.mutate(n._id)}
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        title="Mark as read"
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne.mutate(n._id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-sm text-slate-400">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}