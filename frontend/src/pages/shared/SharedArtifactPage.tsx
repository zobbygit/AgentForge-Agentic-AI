import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Zap, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

export default function SharedArtifactPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-artifact', token],
    queryFn: async () => {
      const { data } = await api.get(`/artifacts/shared/${token}`);
      return data.data.artifact;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050A18] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050A18] flex items-center justify-center px-4">
        <div className="forge-card p-8 text-center max-w-md">
          <FileText size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-1">Link not found or expired</p>
          <p className="text-slate-500 text-sm">This share link may have been revoked by its owner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A18] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display font-bold text-white">AgentForge</span>
          <span className="text-slate-600 text-sm ml-2">· Shared Artifact</span>
        </div>

        <div className="forge-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-white">{data.name}</h1>
              <p className="text-xs text-slate-500 mt-1">
                {data.type} · Generated {format(new Date(data.createdAt), 'PPP')}
              </p>
            </div>
            <span className="status-badge text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Eye size={11} /> {data.shareViewCount} views
            </span>
          </div>
          <div className="p-6">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{data.content}</pre>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by <span className="text-indigo-400">AgentForge</span> — autonomous AI agent platform
        </p>
      </div>
    </div>
  );
}