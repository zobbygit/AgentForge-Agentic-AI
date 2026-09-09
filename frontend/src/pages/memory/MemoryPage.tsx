import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Plus, Trash2, Search, X, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

const TYPES = ['SHORT_TERM','LONG_TERM','SEMANTIC','PROJECT'];
const typeColors: Record<string, string> = {
  SHORT_TERM: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  LONG_TERM: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  SEMANTIC: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  PROJECT: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function MemoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content:'', type:'LONG_TERM', source:'user', tags:'', importance:5 });

  const { data, isLoading } = useQuery({
    queryKey: ['memories', typeFilter, search],
    queryFn: async () => {
      const p = new URLSearchParams({ limit:'50' });
      if (typeFilter) p.append('type', typeFilter);
      if (search) p.append('search', search);
      const { data } = await api.get(`/memory?${p}`);
      return data.data;
    },
  });

  const createMemory = useMutation({
    mutationFn: (payload: any) => api.post('/memory', payload),
    onSuccess: () => { toast.success('Memory added'); qc.invalidateQueries({ queryKey: ['memories'] }); setShowForm(false); setForm({ content:'', type:'LONG_TERM', source:'user', tags:'', importance:5 }); },
    onError: () => toast.error('Failed to add memory'),
  });

  const deleteMemory = useMutation({
    mutationFn: (id: string) => api.delete(`/memory/${id}`),
    onSuccess: () => { toast.success('Memory deleted'); qc.invalidateQueries({ queryKey: ['memories'] }); },
  });

  const clearAll = useMutation({
    mutationFn: () => api.delete(`/memory/clear${typeFilter ? `?type=${typeFilter}` : ''}`),
    onSuccess: () => { toast.success('Memories cleared'); qc.invalidateQueries({ queryKey: ['memories'] }); },
  });

  const memories = data?.memories || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Agent Memory</h1>
          <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} memories stored</p>
        </div>
        <div className="flex gap-2">
          {memories.length > 0 && (
            <button onClick={() => { if(confirm('Clear memories?')) clearAll.mutate(); }}
              className="forge-btn-secondary text-sm py-2 px-4 text-red-400 border-red-500/20 hover:bg-red-500/10">
              Clear All
            </button>
          )}
          <button onClick={() => setShowForm(true)} className="forge-btn-primary text-sm inline-flex items-center gap-2">
            <Plus size={16} /> Add Memory
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search memories..."
            className="forge-input pl-9 text-sm py-2.5" />
        </div>
        <div className="flex gap-2">
          {['', ...TYPES].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${typeFilter === t
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200'}`}>
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
              className="forge-card p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-white">Add Memory</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 p-1"><X size={18} /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); createMemory.mutate({ ...form, tags: form.tags.split(',').map((t:string)=>t.trim()).filter(Boolean) }); }}
                className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Content *</label>
                  <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} required
                    rows={4} className="forge-input resize-none text-sm" placeholder="What should the agent remember?" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Type</label>
                    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="forge-input text-sm">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Importance (1-10)</label>
                    <input type="number" min={1} max={10} value={form.importance} onChange={e=>setForm({...form,importance:+e.target.value})}
                      className="forge-input text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}
                    className="forge-input text-sm" placeholder="auth, backend, api" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)} className="forge-btn-secondary flex-1 text-sm">Cancel</button>
                  <button type="submit" className="forge-btn-primary flex-1 text-sm" disabled={createMemory.isPending}>Save Memory</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory list */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="forge-card h-20 animate-pulse" />)}</div>
      ) : memories.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <Brain size={32} className="text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">No memories yet</p>
          <p className="text-slate-500 text-sm mb-5">Agents automatically store memories after task completion</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((m: any) => (
            <div key={m._id} className="forge-card-hover p-4 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`status-badge border text-xs ${typeColors[m.type] || typeColors.LONG_TERM}`}>{m.type.replace(/_/g,' ')}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(Math.min(m.importance, 5))].map((_,i)=>(<Star key={i} size={10} className="text-amber-400 fill-amber-400" />))}
                  </div>
                  <span className="text-xs text-slate-600 ml-auto">{formatDistanceToNow(new Date(m.createdAt), { addSuffix:true })}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{m.content}</p>
                {m.tags?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {m.tags.map((t:string) => <span key={t} className="text-xs bg-white/[0.04] border border-white/[0.07] text-slate-500 px-2 py-0.5 rounded-md">#{t}</span>)}
                  </div>
                )}
                <p className="text-xs text-slate-600 mt-2">Source: {m.source}</p>
              </div>
              <button onClick={() => { if(confirm('Delete?')) deleteMemory.mutate(m._id); }}
                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg h-fit transition-all flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
