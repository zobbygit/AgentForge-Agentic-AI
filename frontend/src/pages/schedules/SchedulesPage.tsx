import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Trash2, Power, X, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

const CRON_PRESETS = [
  { label: 'Every hour', cron: '0 * * * *', human: 'Every hour' },
  { label: 'Every day at 9am', cron: '0 9 * * *', human: 'Daily at 9:00 AM' },
  { label: 'Every Monday', cron: '0 9 * * 1', human: 'Every Monday at 9:00 AM' },
  { label: 'Every weekday', cron: '0 9 * * 1-5', human: 'Weekdays at 9:00 AM' },
  { label: 'Every Sunday', cron: '0 10 * * 0', human: 'Every Sunday at 10:00 AM' },
];

export default function SchedulesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', cronExpression: '0 9 * * *', humanReadable: 'Daily at 9:00 AM' });

  const { data, isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: async () => { const { data } = await api.get('/schedules'); return data.data.schedules; },
  });

  const createSchedule = useMutation({
    mutationFn: (payload: any) => api.post('/schedules', payload),
    onSuccess: () => { toast.success('Schedule created'); qc.invalidateQueries({ queryKey: ['schedules'] }); setShowForm(false); setForm({ name:'', goal:'', cronExpression:'0 9 * * *', humanReadable:'Daily at 9:00 AM' }); },
    onError: () => toast.error('Failed to create schedule'),
  });

  const toggleSchedule = useMutation({
    mutationFn: (id: string) => api.post(`/schedules/${id}/toggle`),
    onSuccess: () => { toast.success('Schedule updated'); qc.invalidateQueries({ queryKey: ['schedules'] }); },
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: string) => api.delete(`/schedules/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['schedules'] }); },
  });

  const schedules = data || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Scheduled Agents</h1>
          <p className="text-slate-400 text-sm mt-0.5">Automate recurring agent tasks</p>
        </div>
        <button onClick={() => setShowForm(true)} className="forge-btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={16} /> New Schedule
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="forge-card p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-white">New Schedule</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); createSchedule.mutate(form); }} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Schedule Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    className="forge-input text-sm" placeholder="Weekly Competitor Analysis" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Agent Goal *</label>
                  <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} required
                    rows={3} className="forge-input text-sm resize-none" placeholder="Describe what the agent should do each time it runs..." />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Frequency</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {CRON_PRESETS.map(p => (
                      <button key={p.cron} type="button"
                        onClick={() => setForm({ ...form, cronExpression: p.cron, humanReadable: p.human })}
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                          form.cronExpression === p.cron
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                            : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200'
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <input value={form.cronExpression} onChange={e => setForm({ ...form, cronExpression: e.target.value })}
                    className="forge-input text-sm font-mono" placeholder="Cron expression" />
                  <p className="text-xs text-slate-500 mt-1">{form.humanReadable}</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)} className="forge-btn-secondary flex-1 text-sm">Cancel</button>
                  <button type="submit" className="forge-btn-primary flex-1 text-sm" disabled={createSchedule.isPending}>Create Schedule</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="forge-card h-24 animate-pulse" />)}</div>
      ) : schedules.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <Calendar size={32} className="text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">No schedules yet</p>
          <p className="text-slate-500 text-sm mb-5">Automate repetitive tasks — daily reports, weekly analysis, monitoring</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s: any) => (
            <div key={s._id} className="forge-card-hover p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.isActive ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/[0.03] border border-white/[0.08]'}`}>
                  <Calendar size={18} className={s.isActive ? 'text-green-400' : 'text-slate-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{s.name}</h3>
                    <span className={`status-badge text-xs border ${s.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {s.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{s.goal}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-slate-500 font-mono">{s.cronExpression}</p>
                    <p className="text-xs text-slate-600">· {s.humanReadable}</p>
                    <p className="text-xs text-slate-600">· {s.runCount} runs · {s.successCount} success</p>
                    {s.lastRun && <p className="text-xs text-slate-600">Last: {formatDistanceToNow(new Date(s.lastRun), { addSuffix: true })}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleSchedule.mutate(s._id)}
                    className={`p-2 rounded-lg transition-all ${s.isActive ? 'text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-green-500/10 hover:text-green-400'}`}
                    title={s.isActive ? 'Pause' : 'Activate'}>
                    <Power size={15} />
                  </button>
                  <button onClick={() => { if(confirm('Delete schedule?')) deleteSchedule.mutate(s._id); }}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
