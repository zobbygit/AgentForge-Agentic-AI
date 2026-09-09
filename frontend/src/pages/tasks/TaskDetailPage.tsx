import { useParams, useNavigate } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useEffect, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Zap, Bot, Wrench,
  FileText, RefreshCw, X, Copy, ChevronDown, ChevronUp, AlertTriangle,
  MessageCircle, Send
} from 'lucide-react';

import { formatDistanceToNow, format } from 'date-fns';

import api from '../../services/api';

import { getSocket, joinTaskRoom, leaveTaskRoom } from '../../services/socket';

import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, {
  color: string;
  bg: string;
  border: string;
  dot: string;
}> = {
  PENDING: {
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500'
  },

  PLANNING: {
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    dot: 'bg-indigo-400 animate-pulse'
  },

  RUNNING: {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-400 animate-pulse'
  },

  WAITING: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    dot: 'bg-yellow-400'
  },

  APPROVAL_REQUIRED: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400 animate-pulse'
  },

  COMPLETED: {
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    dot: 'bg-green-400'
  },

  FAILED: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-400'
  },

  CANCELLED: {
    color: 'text-slate-500',
    bg: 'bg-slate-600/10',
    border: 'border-slate-600/20',
    dot: 'bg-slate-600'
  },
};

interface LiveEvent {
  id: string;
  time: Date;
  event: string;
  data?: Record<string, unknown>;
  category: 'agent' | 'tool' | 'task' | 'artifact' | 'approval' | 'verification';
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  const qc = useQueryClient();

  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const [showResult, setShowResult] = useState(false);

  const [commentText, setCommentText] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['task', id],

    queryFn: async () => {
      const { data } = await api.get(`/tasks/${id}`);

      return data.data.task;
    },

    refetchInterval: (query) => {
      const taskData = query.state.data as { status?: string } | undefined;

      return ['RUNNING', 'PLANNING', 'WAITING', 'APPROVAL_REQUIRED'].includes(
        taskData?.status ?? ''
      )
        ? 3000
        : false;
    },
  });

  const { data: docsData } = useQuery({
    queryKey: ['task-documents', id],

    queryFn: async () => {
      const { data } = await api.get(`/documents?taskId=${id}`);

      return data.data.documents;
    },

    enabled: !!id,
  });

  // Comments
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['task-comments', id],

    queryFn: async () => {
      const { data } = await api.get(`/comments/task/${id}`);

      return data.data.comments;
    },

    enabled: !!id,
  });

  const addComment = useMutation({
    mutationFn: (content: string) =>
      api.post(`/comments/task/${id}`, { content }),

    onSuccess: () => {
      setCommentText('');

      refetchComments();
    },

    onError: () => toast.error('Failed to add comment'),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/comments/${commentId}`),

    onSuccess: () => refetchComments(),
  });

  // Socket live events
  useEffect(() => {
    if (!id) return;

    const socket = getSocket();

    if (!socket) return;

    joinTaskRoom(id);

    const addEvent = (
      event: string,
      category: LiveEvent['category'],
      raw?: Record<string, unknown>
    ) => {
      setLiveEvents(prev => [
        {
          id: `${Date.now()}-${Math.random()}`,
          time: new Date(),
          event,
          data: raw,
          category
        },
        ...prev.slice(0, 99),
      ]);
    };

    socket.on('task.started', (d) => {
      addEvent('Task started', 'task', d);
      refetch();
    });

    socket.on('plan.created', (d) => {
      addEvent(
        `Plan created · ${d.steps?.length} steps · ${d.category || ''} model`,
        'task',
        d
      );

      refetch();
    });

    socket.on('agent.started', (d) => {
      addEvent(`Agent started: ${d.agent} → ${d.step}`, 'agent', d);
    });

    socket.on('tool.started', (d) => {
      addEvent(`Tool: ${d.tool}`, 'tool', d);
    });

    socket.on('tool.completed', (d) => {
      addEvent(`Tool done: ${d.tool}`, 'tool', d);
    });

    socket.on('tool.failed', (d) => {
      addEvent(`Tool failed: ${d.tool}`, 'tool', d);
    });

    socket.on('artifact.created', (d) => {
      addEvent(`Artifact: ${d.name}`, 'artifact', d);
      refetch();
    });

    socket.on('approval.required', (d) => {
      addEvent('Approval required!', 'approval', d);

      refetch();

      toast('Action requires your approval', {
        icon: '⚠️'
      });
    });

    socket.on('verification.started', () => {
      addEvent('Verifying result…', 'verification');
    });

    socket.on('verification.completed', (d) => {
      addEvent(
        `Verified · confidence ${d.confidence}%`,
        'verification',
        d
      );
    });

    socket.on('task.completed', (d) => {
      addEvent('Task completed ✓', 'task', d);

      refetch();

      qc.invalidateQueries({
        queryKey: ['dashboard-stats']
      });
    });

    socket.on('task.failed', (d) => {
      addEvent(`Task failed: ${d.error || ''}`, 'task', d);

      refetch();
    });

    return () => {
      leaveTaskRoom(id);

      [
        'task.started',
        'plan.created',
        'agent.started',
        'tool.started',
        'tool.completed',
        'tool.failed',
        'artifact.created',
        'approval.required',
        'verification.started',
        'verification.completed',
        'task.completed',
        'task.failed'
      ].forEach(ev => socket.off(ev));
    };
  }, [id]);

  const cancelTask = useMutation({
    mutationFn: () => api.post(`/tasks/${id}/cancel`),

    onSuccess: () => {
      toast.success('Task cancelled');

      refetch();
    },

    onError: () => toast.error('Failed to cancel task'),
  });

  const retryTask = useMutation({
    mutationFn: () => api.post(`/tasks/${id}/retry`),

    onSuccess: (res) => {
      toast.success('Retry started');

      navigate(`/tasks/${res.data.data.task._id}`);
    },

    onError: () => toast.error('Failed to retry task'),
  });

  const respondToApproval = useMutation({
    mutationFn: ({
      approvalId,
      decision
    }: {
      approvalId: string;
      decision: string;
    }) =>
      api.post(`/approvals/${approvalId}/respond`, {
        decision
      }),

    onSuccess: (_, vars) => {
      toast.success(`Action ${vars.decision}d`);

      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400">
        Task not found
      </div>
    );
  }

  const task = data;

  const statusCfg =
    STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;

  const isActive = [
    'RUNNING',
    'PLANNING',
    'WAITING'
  ].includes(task.status);

  const completedSteps =
    task.steps?.filter(
      (s: any) => s.status === 'COMPLETED'
    ).length || 0;

  const totalSteps = task.steps?.length || 0;

  const eventColors: Record<string, string> = {
    agent: 'text-cyan-400',
    tool: 'text-yellow-400',
    task: 'text-indigo-400',
    artifact: 'text-violet-400',
    approval: 'text-amber-400',
    verification: 'text-green-400',
  };

  // Keep the rest of your existing JSX below this point exactly as it was.

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => navigate('/tasks')} className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-white/5 transition-all mt-1">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-xl font-bold text-white truncate">{task.title}</h1>
            <span className={`status-badge border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {task.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 truncate">{task.goal}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isActive && (
            <button onClick={() => cancelTask.mutate()} disabled={cancelTask.isPending}
              className="forge-btn-secondary text-sm py-2 px-3 flex items-center gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10">
              <X size={14} /> Cancel
            </button>
          )}
          {(task.status === 'FAILED' || task.status === 'CANCELLED') && (
            <button onClick={() => retryTask.mutate()} disabled={retryTask.isPending}
              className="forge-btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
              <RefreshCw size={14} /> Retry
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div className="forge-card px-5 py-4 mb-5 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Progress</span>
              <span>{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Model</p>
            <p className="text-xs text-slate-300 font-mono truncate max-w-[140px]">
              {task.selectedModel?.split('/').pop() || '—'}
            </p>
          </div>
        </div>
      )}

      {/* Approval required banner */}
      {task.status === 'APPROVAL_REQUIRED' && task.approvals?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="forge-card p-5 border-amber-500/30 bg-amber-500/5 mb-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-300">Human Approval Required</p>
              <p className="text-sm text-slate-400 mt-1">The agent wants to perform a high-risk action and needs your authorization.</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => respondToApproval.mutate({ approvalId: task.approvals[0]._id, decision: 'approve' })}
                  className="forge-btn-primary text-sm py-2 px-5 bg-green-600 hover:bg-green-500 shadow-green-500/20">
                  Approve
                </button>
                <button onClick={() => respondToApproval.mutate({ approvalId: task.approvals[0]._id, decision: 'reject' })}
                  className="forge-btn-secondary text-sm py-2 px-5 text-red-400 border-red-500/20">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Steps panel */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-display font-semibold text-white text-sm">Execution Plan</h2>
          {totalSteps === 0 && isActive && (
            <div className="forge-card p-5 text-center">
              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Agent is planning steps...</p>
            </div>
          )}
          {task.steps?.map((step: any) => {
            const sCfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.PENDING;
            const isExpanded = expandedStep === step.id;
            return (
              <div key={step.id} className={`forge-card overflow-hidden border ${sCfg.border}`}>
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sCfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.assignedAgent} agent</p>
                  </div>
                  {isExpanded ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-white/[0.05]">
                      <div className="px-4 py-3 space-y-2">
                        <p className="text-xs text-slate-400">{step.description}</p>
                        {step.requiredTool && (
                          <p className="text-xs text-yellow-400 flex items-center gap-1">
                            <Wrench size={11} /> Tool: {step.requiredTool}
                          </p>
                        )}
                        {step.result && (
                          <div className="bg-black/30 rounded-lg p-2.5">
                            <p className="text-xs text-slate-400 line-clamp-4">{step.result}</p>
                          </div>
                        )}
                        {step.error && (
                          <p className="text-xs text-red-400 flex items-center gap-1">
                            <XCircle size={11} /> {step.error}
                          </p>
                        )}
                        {step.retryCount > 0 && (
                          <p className="text-xs text-slate-500">Retries: {step.retryCount}/{step.maxRetries}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Live feed + result */}
        <div className="lg:col-span-3 space-y-4">
          {/* Live event feed */}
          <div className="forge-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h2 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                <Zap size={14} className="text-indigo-400" /> Live Feed
              </h2>
              {isActive && <div className="flex items-center gap-1.5 text-xs text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Streaming
              </div>}
            </div>
            <div className="p-4 font-mono text-xs space-y-2 max-h-72 overflow-y-auto no-scrollbar">
              {liveEvents.length === 0 && (
                <p className="text-slate-600 text-center py-4">
                  {isActive ? 'Waiting for agent events...' : 'No live events captured'}
                </p>
              )}
              <AnimatePresence>
                {liveEvents.map((ev) => (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2.5">
                    <span className="text-slate-600 flex-shrink-0 w-16">
                      {format(ev.time, 'HH:mm:ss')}
                    </span>
                    <span className={eventColors[ev.category] || 'text-slate-400'}>{ev.event}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Result */}
          {task.result && (
            <div className="forge-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <h2 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400" /> Result
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(task.result); toast.success('Copied!'); }}
                    className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-white/5">
                    <Copy size={13} />
                  </button>
                  <button onClick={() => setShowResult(!showResult)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded">
                    {showResult ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>
              <div className={`p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap overflow-auto ${showResult ? '' : 'max-h-48'}`}>
                {task.result}
              </div>
            </div>
          )}

          {/* Artifacts */}
          {task.artifacts?.length > 0 && (
            <div className="forge-card overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <h2 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <FileText size={14} className="text-violet-400" /> Artifacts ({task.artifacts.length})
                </h2>
              </div>
              <div className="p-3 space-y-2">
                {task.artifacts.map((a: any) => (
                  <div key={a._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all">
                    <FileText size={14} className="text-violet-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.type}</p>
                    </div>
                <a href={`${import.meta.env.VITE_API_URL || '/api'}/artifacts/${a._id}/download?token=${localStorage.getItem('accessToken') || ''}`}
  target="_blank"
  rel="noreferrer"
  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded hover:bg-indigo-500/10">
  Download
</a>
                  </div>
                ))}
              </div>
            </div>
          )}
      {/* Attached documents */}
          {docsData?.length > 0 && (
            <div className="forge-card overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <h2 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400" /> Attached Documents ({docsData.length})
                </h2>
              </div>
              <div className="p-3 space-y-2">
                {docsData.map((d: any) => (
                  <div key={d._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all">
                    <FileText size={14} className="text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">{d.originalName}</p>
                      <p className="text-xs text-slate-500">{(d.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <span className={`status-badge text-xs border ${
                      d.status === 'INDEXED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      d.status === 'PROCESSING' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      d.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Comments */}
          <div className="forge-card overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h2 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                <MessageCircle size={14} className="text-cyan-400" /> Notes ({comments?.length || 0})
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto no-scrollbar">
              {(!comments || comments.length === 0) && (
                <p className="text-xs text-slate-600 text-center py-3">No notes yet. Add context or observations below.</p>
              )}
              {comments?.map((c: any) => (
                <div key={c._id} className="flex items-start gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                    {c.userId?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>
                    <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</p>
                  </div>
                  <button onClick={() => deleteComment.mutate(c._id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all flex-shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/[0.06] flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) addComment.mutate(commentText.trim()); }}
                placeholder="Add a note..."
                className="forge-input text-xs py-2 flex-1"
              />
              <button
                onClick={() => commentText.trim() && addComment.mutate(commentText.trim())}
                disabled={!commentText.trim() || addComment.isPending}
                className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg px-3 disabled:opacity-40 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>


          {/* Meta info */}
          <div className="forge-card p-4 grid grid-cols-3 gap-4 text-xs">
            {[
              ['Created', formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })],
              ['Priority', task.priority],
              ['Retries', task.retryCount],
              ['Duration', task.actualDuration ? `${Math.round(task.actualDuration / 1000)}s` : '—'],
              ['Max Duration', task.maxDurationMs ? `${Math.round(task.maxDurationMs / 60000)} min` : '5 min'],
              ['Tokens Used', task.totalTokensUsed ? task.totalTokensUsed.toLocaleString() : '0'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-slate-500 mb-0.5">{label}</p>
                <p className="text-slate-300 font-medium capitalize">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
