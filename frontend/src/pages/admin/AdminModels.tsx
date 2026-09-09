import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminModels() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-models'],
    queryFn: async () => { const { data } = await api.get('/admin/models'); return data.data.models; },
  });

  const updateModel = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.put(`/admin/models/${id}`, payload),
    onSuccess: () => { toast.success('Model updated'); qc.invalidateQueries({ queryKey: ['admin-models'] }); },
    onError: () => toast.error('Failed to update'),
  });

  const models = data || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">AI Model Management</h1>
        <p className="text-slate-400 text-sm mt-0.5">Configure which models are available and their priorities</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(7)].map((_,i)=><div key={i} className="forge-card h-20 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {models.map((m: any) => (
            <div key={m._id} className="forge-card-hover p-5 flex items-center gap-4">
              <Cpu size={18} className="text-indigo-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-200">{m.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    m.category === 'REASONING' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
                    m.category === 'CODING' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                    m.category === 'FAST' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    m.category === 'LONG_CONTEXT' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }`}>{m.category}</span>
                  {m.isFree && <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Free</span>}
                  {m.isPrimary && <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Primary</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{m.modelId}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                  <span>{m.usageCount} uses</span>
                  <span>{m.errorCount} errors</span>
                  <span>{m.fallbackCount} fallbacks</span>
                  <span>Priority: {m.priority}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right text-xs">
                  <p className="text-slate-500">{(m.contextWindow / 1000).toFixed(0)}K ctx</p>
                  <p className="text-slate-600">{m.provider}</p>
                </div>
                <button
                  onClick={() => updateModel.mutate({ id: m._id, payload: { isEnabled: !m.isEnabled } })}
                  className={`transition-colors ${m.isEnabled ? 'text-green-400 hover:text-red-400' : 'text-slate-600 hover:text-green-400'}`}
                  title={m.isEnabled ? 'Disable model' : 'Enable model'}
                >
                  {m.isEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
