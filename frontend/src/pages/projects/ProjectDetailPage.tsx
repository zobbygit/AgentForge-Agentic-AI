import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Users, Lock, Clock, FolderKanban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data.data.project;
    },
    refetchInterval: 15000, // poll so team members see recent updates
  });

  useEffect(() => {
    if (data && !hasUnsavedChanges) {
      setContent(data.workspaceContent || '');
    }
  }, [data]);

  const saveWorkspace = useMutation({
    mutationFn: (newContent: string) => api.put(`/projects/${id}/workspace`, { content: newContent }),
    onSuccess: () => {
      toast.success('Workspace saved');
      setHasUnsavedChanges(false);
      qc.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save workspace');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    saveWorkspace.mutate(content);
  };

  // Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges) handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [content, hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-center text-slate-400">Project not found</div>;
  }

  const isOwner = data.userId === user?._id || data.userId?._id === user?._id;
  const isTeamProject = !!data.teamId;

  // Determine edit permission via role — backend enforces this too, this is just UI hinting
  const canEdit = isOwner || isTeamProject; // team membership already filtered by getProject; role check happens server-side

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/projects')} className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-white/5 transition-all flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${data.color}20`, border: `1px solid ${data.color}40` }}>
            {data.icon}
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-white truncate">{data.name}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {isTeamProject && (
                <span className="flex items-center gap-1 text-indigo-400">
                  <Users size={11} /> {data.teamId?.name || 'Team'}
                </span>
              )}
              {data.workspaceUpdatedAt && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  Saved {formatDistanceToNow(new Date(data.workspaceUpdatedAt), { addSuffix: true })}
                  {data.workspaceUpdatedBy?.name && ` by ${data.workspaceUpdatedBy.name}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || saveWorkspace.isPending}
          className="forge-btn-primary text-sm py-2 px-4 flex items-center gap-2 flex-shrink-0 disabled:opacity-40"
        >
          <Save size={14} />
          {saveWorkspace.isPending ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        {!canEdit && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-800/90 border border-white/[0.1] text-slate-400 text-xs px-3 py-1.5 rounded-lg">
            <Lock size={11} /> View only
          </div>
        )}
        <textarea
          value={content}
          onChange={handleChange}
          disabled={!canEdit}
          placeholder="Write project notes, architecture decisions, TODOs, meeting notes... shared live with your team."
          className="w-full h-full bg-[#050A18] resize-none p-6 text-sm text-slate-300 leading-relaxed focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed font-mono"
          spellCheck={false}
        />
      </div>

      {/* Footer status bar */}
      <div className="px-6 py-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
        <span>{content.length} characters · {content.split('\n').length} lines</span>
        <span>{hasUnsavedChanges ? 'Unsaved changes · Ctrl+S to save' : 'All changes saved'}</span>
      </div>
    </div>
  );
}