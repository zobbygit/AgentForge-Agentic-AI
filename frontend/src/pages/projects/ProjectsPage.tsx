import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, Trash2, Edit2, X, Check, Users, FileEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366F1','#22D3EE','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#F97316'];
const ICONS = ['🚀','📦','🔧','🧪','🎯','💡','🔬','📊','🛡️','⚙️'];

export default function ProjectsPage() {
  const qc = useQueryClient();
    const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name:'', description:'', techStack:'', color:'#6366F1', icon:'🚀', teamId:'' });

  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => { const { data } = await api.get('/teams'); return data.data.teams; },
  });
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => { const { data } = await api.get('/projects'); return data.data.projects; },
  });

  const createProject = useMutation({
    mutationFn: (payload: any) => api.post('/projects', payload),
    onSuccess: () => { toast.success('Project created'); qc.invalidateQueries({ queryKey: ['projects'] }); setShowForm(false); resetForm(); },
    onError: () => toast.error('Failed to create project'),
  });

  const updateProject = useMutation({
    mutationFn: ({ id, ...payload }: any) => api.put(`/projects/${id}`, payload),
    onSuccess: () => { toast.success('Project updated'); qc.invalidateQueries({ queryKey: ['projects'] }); setEditing(null); },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => { toast.success('Project deleted'); qc.invalidateQueries({ queryKey: ['projects'] }); },
  });

   const resetForm = () => setForm({ name:'', description:'', techStack:'', color:'#6366F1', icon:'🚀', teamId:'' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, techStack: form.techStack.split(',').map((t:string)=>t.trim()).filter(Boolean) };
    if (editing) { updateProject.mutate({ id: editing._id, ...payload }); }
    else { createProject.mutate(payload); }
  };

  const startEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      techStack: (p.techStack || []).join(', '),
      color: p.color,
      icon: p.icon,
      teamId: p.teamId?._id || p.teamId || '',
    });
    setShowForm(true);
  };
  const projects = data || [];
   const sharedCount = projects.filter((p: any) => p.teamId).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">Organize tasks with project context</p>
        </div>
        <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="forge-btn-primary inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> New Project
        </button>
      </div>
            {sharedCount > 0 && (
        <div className="forge-card px-4 py-2.5 mb-5 flex items-center gap-2 text-xs text-indigo-300 border-indigo-500/20 bg-indigo-500/5">
          <Users size={13} />
          {sharedCount} project{sharedCount > 1 ? 's are' : ' is'} shared via a team you belong to
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="forge-card p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-white">{editing ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-500 hover:text-slate-300 p-1">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 mb-1.5 block">Project Name *</label>
                    <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required
                      className="forge-input text-sm" placeholder="My Project" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Icon</label>
                    <select value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})}
                      className="forge-input text-sm w-20">
                      {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                    rows={2} className="forge-input text-sm resize-none" placeholder="What is this project about?" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Tech Stack (comma separated)</label>
                  <input value={form.techStack} onChange={e=>setForm({...form,techStack:e.target.value})}
                    className="forge-input text-sm" placeholder="React, Node.js, MongoDB" />
                </div>
                     {teams?.length > 0 && (
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">
                      Team {editing ? '(move this project to a team, or keep personal)' : '(optional — shared with team members)'}
                    </label>
                    <select value={form.teamId} onChange={e=>setForm({...form,teamId:e.target.value})} className="forge-input text-sm">
                      <option value="">Personal project (only you)</option>
                      {teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={()=>setForm({...form,color:c})}
                        className={`w-7 h-7 rounded-full flex-shrink-0 transition-transform ${form.color===c ? 'scale-125 ring-2 ring-white/40' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={()=>{setShowForm(false);setEditing(null);}} className="forge-btn-secondary flex-1 text-sm">Cancel</button>
                  <button type="submit" className="forge-btn-primary flex-1 text-sm" disabled={createProject.isPending || updateProject.isPending}>
                    {editing ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i)=><div key={i} className="forge-card h-40 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="forge-card p-12 text-center">
          <FolderKanban size={32} className="text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">No projects yet</p>
          <p className="text-slate-500 text-sm mb-5">Group related tasks into projects for better organization</p>
          <button onClick={()=>setShowForm(true)} className="forge-btn-primary text-sm inline-flex items-center gap-2">
            <Plus size={14} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((p: any) => (
                <motion.div key={p._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              onClick={() => navigate(`/projects/${p._id}`)}
              className="forge-card-hover p-5 flex flex-col cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${p.color}20`, border: `1px solid ${p.color}40` }}>
                    {p.icon}
                  </div>
                             <div>
                    <h3 className="font-display font-semibold text-white text-sm">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs capitalize ${p.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>{p.status}</span>
                      {p.teamId && (
                        <span className="flex items-center gap-1 text-xs text-indigo-400">
                          <Users size={10} /> {p.teamId.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>


                     <div className="flex gap-1">
                  <button onClick={(e)=>{e.stopPropagation(); startEdit(p);}} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-white/5">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={(e)=>{e.stopPropagation(); if(confirm('Delete project?')) deleteProject.mutate(p._id);}}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>


              </div>
              {p.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.description}</p>}
              {p.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {p.techStack.slice(0,4).map((t:string) => (
                    <span key={t} className="text-xs bg-white/[0.05] border border-white/[0.08] text-slate-400 px-2 py-0.5 rounded-md">{t}</span>
                  ))}
                  {p.techStack.length > 4 && <span className="text-xs text-slate-500">+{p.techStack.length-4}</span>}
                </div>
              )}

                            {p.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {p.techStack.slice(0,4).map((t:string) => (
                    <span key={t} className="text-xs bg-white/[0.05] border border-white/[0.08] text-slate-400 px-2 py-0.5 rounded-md">{t}</span>
                  ))}
                  {p.techStack.length > 4 && <span className="text-xs text-slate-500">+{p.techStack.length-4}</span>}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-white/[0.05]">
                <FileEdit size={11} /> Click to open workspace
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
