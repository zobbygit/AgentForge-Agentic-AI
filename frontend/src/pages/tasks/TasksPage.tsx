import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Zap, Clock, Trash2, RefreshCw, Eye, Download, FileJson } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'PENDING', 'PLANNING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'APPROVAL_REQUIRED'];

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  RUNNING:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  PLANNING:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  FAILED:    'bg-red-500/10 text-red-400 border-red-500/20',
  PENDING:   'bg-slate-500/10 text-slate-400 border-slate-500/20',
  CANCELLED: 'bg-slate-600/10 text-slate-500 border-slate-600/20',
  APPROVAL_REQUIRED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/tasks?${params}`);
      return data.data;
    },
    refetchInterval: 10000,
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => { toast.success('Task deleted'); qc.invalidateQueries({ queryKey: ['tasks'] }); },
    onError: () => toast.error('Failed to delete task'),
  });

  const retryTask = useMutation({
    mutationFn: (id: string) => api.post(`/tasks/${id}/retry`),
    onSuccess: () => { toast.success('Retry started'); qc.invalidateQueries({ queryKey: ['tasks'] }); },
    onError: () => toast.error('Failed to retry'),
  });

  const tasks = (data?.tasks || []).filter((t: any) =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.goal?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">

  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Tasks</h1>
      <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} total tasks</p>
    </div>

    <div className="flex items-center gap-2">

      <a
        href={`${import.meta.env.VITE_API_URL || '/api'}/export/tasks/csv?token=${localStorage.getItem('accessToken') || ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
        className="forge-btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
        title="Export CSV"
      >
        <Download size={14} /> CSV
      </a>

      <a
        href={`${import.meta.env.VITE_API_URL || '/api'}/export/tasks/json?token=${localStorage.getItem('accessToken') || ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
        className="forge-btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
        title="Export JSON"
      >
        <FileJson size={14} /> JSON
      </a>

      <Link
        to="/tasks/new"
        className="forge-btn-primary inline-flex items-center gap-2 text-sm"
      >
        <Plus size={16} /> New Task
      </Link>

    </div>
  </div>





      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..." className="forge-input pl-9 text-sm py-2.5"
          />
        </div>
        <div className="relative">
          <Filter
  size={14}
  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
/>

<select
  value={statusFilter}
  onChange={e => {
    setStatusFilter(e.target.value);
    setPage(1);
  }}
  className="forge-input pl-9 pr-8 text-sm py-2.5 appearance-none min-w-[160px]"
>
  <option value="" className="bg-slate-900 text-slate-200">
    All statuses
  </option>

  {STATUS_OPTIONS.filter(Boolean).map(s => (
    <option
      key={s}
      value={s}
      className="bg-slate-900 text-slate-200"
    >
      {s}
    </option>
  ))}
</select>
        </div>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="forge-card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <Zap size={32} className="text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">No tasks found</p>
          <p className="text-slate-500 text-sm mb-5">Create your first agent task to get started</p>
          <Link to="/tasks/new" className="forge-btn-primary text-sm inline-flex items-center gap-2">
            <Plus size={14} /> Create Task
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task: any) => (
            <div key={task._id} className="forge-card-hover p-4 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                task.status === 'COMPLETED' ? 'bg-green-400' :
                ['RUNNING','PLANNING'].includes(task.status) ? 'bg-cyan-400 animate-pulse' :
                task.status === 'FAILED' ? 'bg-red-400' :
                task.status === 'APPROVAL_REQUIRED' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                  <span className={`status-badge border text-xs flex-shrink-0 ${statusColors[task.status] || statusColors.PENDING}`}>
                    {task.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{task.goal}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock size={10} /> {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                  </span>
                  {task.steps?.length > 0 && (
                    <span className="text-xs text-slate-600">
                      {task.steps.filter((s: any) => s.status === 'COMPLETED').length}/{task.steps.length} steps
                    </span>
                  )}
                  {task.priority !== 'medium' && (
                    <span className={`text-xs capitalize ${task.priority === 'high' ? 'text-red-400' : 'text-slate-500'}`}>
                      {task.priority} priority
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link to={`/tasks/${task._id}`}
                  className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                  title="View task">
                  <Eye size={15} />
                </Link>
                {(task.status === 'FAILED' || task.status === 'CANCELLED') && (
                  <button onClick={() => retryTask.mutate(task._id)}
                    className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                    title="Retry task">
                    <RefreshCw size={15} />
                  </button>
                )}
                {['COMPLETED','FAILED','CANCELLED'].includes(task.status) && (
                  <button onClick={() => { if (confirm('Delete this task?')) deleteTask.mutate(task._id); }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete task">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
          <span className="flex items-center px-4 text-sm text-slate-400">{page} / {data.totalPages}</span>
          <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}
            className="forge-btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
