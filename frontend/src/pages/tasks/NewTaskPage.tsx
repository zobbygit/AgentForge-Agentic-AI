import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Sparkles, Brain, Code2, BarChart3, Search, FileText, Shield, MessageSquare, Upload, X, Paperclip, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EXAMPLE_GOALS = [
  { icon: Search, label: 'Research', text: 'Research the latest AI agent frameworks and summarize key differences with recommendations' },
  { icon: Code2, label: 'Code Review', text: 'Review the authentication module for security vulnerabilities and suggest improvements' },
  { icon: BarChart3, label: 'Data Analysis', text: 'Analyze Q3 sales data, identify top-performing products, and generate an executive report' },
  { icon: FileText, label: 'Documentation', text: 'Write comprehensive API documentation for the user management endpoints' },
  { icon: Brain, label: 'Planning', text: 'Create a 3-month product roadmap for an AI SaaS startup targeting enterprise customers' },
  { icon: Shield, label: 'Security Audit', text: 'Perform a security audit checklist for a Node.js Express API with MongoDB' },
];

const PRIORITIES = ['low', 'medium', 'high'];

export default function NewTaskPage() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState('');
  const [tags, setTags] = useState('');
  const [maxDurationMs, setMaxDurationMs] = useState(300000); 
   const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);// 5 min default
    const { isListening, isSupported, startListening, stopListening } = useVoiceInput((text) => {
    setGoal(prev => prev ? `${prev} ${text}` : text);
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => { const { data } = await api.get('/projects'); return data.data.projects; },
  });

  const createTask = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/tasks', payload);
      return data.data.task;
    },
    onSuccess: async (task) => {
      toast.success('Agent started! Monitoring execution...', { icon: '🤖' });
      await uploadFiles(task._id);
      navigate(`/tasks/${task._id}`);
    },
     onError: (err: any) => {
      if (err?.response?.status === 429) {
        toast.error(err.response.data.message, { duration: 6000, icon: '⏳' });
      } else {
        toast.error(err?.response?.data?.message || 'Failed to create task');
      }
    },
  });
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f =>
      ['text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/pdf'].includes(f.type) &&
      f.size <= 10 * 1024 * 1024
    );
    if (valid.length < selected.length) {
      toast.error('Some files skipped — only txt/md/csv/json/pdf under 10MB allowed');
    }
    setFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const uploadFiles = async (taskId: string) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taskId', taskId);
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success(`${files.length} file(s) uploaded and being indexed`);
    } catch {
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) { toast.error('Please enter a goal'); return; }
    createTask.mutate({
      goal: goal.trim(),
      priority,
      projectId: projectId || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      maxDurationMs,
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-white/5 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">New Agent Task</h1>
          <p className="text-slate-400 text-sm mt-0.5">Describe your goal in plain English</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal input */}
          {/* Goal input */}
        <div className="forge-card p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Sparkles size={15} className="text-indigo-400" /> Your Goal
            </label>
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                  isListening
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                }`}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                {isListening ? 'Stop' : 'Voice input'}
              </button>
            )}
          </div>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Describe what you want the AI agent to accomplish. Be specific about the expected output... or click the mic to speak"
            rows={5}
            className="forge-input resize-none text-sm"
            required
          />
          <p className="text-xs text-slate-600 mt-2">
            {goal.length} characters · Agents work best with clear, specific goals
            {isListening && <span className="text-red-400 ml-2">● Listening...</span>}
          </p>
        </div>

        {/* Example goals */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">Or start from a template</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {EXAMPLE_GOALS.map(({ icon: Icon, label, text }) => (
              <button
                key={label}
                type="button"
                onClick={() => setGoal(text)}
                className="forge-card-hover p-3.5 text-left group"
              >
                <Icon size={16} className="text-indigo-400 mb-2" />
                <p className="text-xs font-medium text-slate-300">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{text.substring(0, 60)}...</p>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="forge-card p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-5">Task Options</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Priority */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all border ${
                      priority === p
                        ? p === 'high' ? 'bg-red-500/15 border-red-500/30 text-red-400'
                        : p === 'medium' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : 'bg-slate-500/15 border-slate-500/30 text-slate-400'
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Project */}
<div>
  <label className="text-xs text-slate-400 mb-2 block">
    Project (optional)
  </label>

  <select
    value={projectId}
    onChange={e => setProjectId(e.target.value)}
    className="forge-input text-sm bg-slate-900 text-slate-200"
  >
    <option value="" className="bg-slate-900 text-slate-200">
      No project
    </option>

    {projectsData?.map((p: any) => (
      <option
        key={p._id}
        value={p._id}
        className="bg-slate-900 text-slate-200"
      >
        {p.icon} {p.name}
      </option>
    ))}
  </select>
</div>

            {/* Tags */}
<div>
  <label className="text-xs text-slate-400 mb-2 block">Max Duration</label>

  <select
    value={maxDurationMs}
    onChange={e => setMaxDurationMs(Number(e.target.value))}
    className="forge-input text-sm bg-slate-900 text-slate-200"
  >
    <option className="bg-slate-900 text-slate-200" value={60000}>
      1 minute
    </option>
    <option className="bg-slate-900 text-slate-200" value={180000}>
      3 minutes
    </option>
    <option className="bg-slate-900 text-slate-200" value={300000}>
      5 minutes (default)
    </option>
    <option className="bg-slate-900 text-slate-200" value={600000}>
      10 minutes
    </option>
    <option className="bg-slate-900 text-slate-200" value={1200000}>
      20 minutes
    </option>
    <option className="bg-slate-900 text-slate-200" value={1800000}>
      30 minutes
    </option>
  </select>
</div>

            {/* Tags */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Tags (comma separated, optional)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="research, report, weekly"
                className="forge-input text-sm"
              />
            </div>
          </div>
        </div>


        
                {/* File attachments */}
        <div className="forge-card p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Paperclip size={15} className="text-indigo-400" /> Attach Documents (optional)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Upload files for the agent to reference. Supports .txt, .md, .csv, .json, .pdf (max 10MB each).
          </p>

          <label className="forge-card-hover flex flex-col items-center justify-center py-8 cursor-pointer border-dashed">
            <Upload size={24} className="text-indigo-400 mb-2" />
            <span className="text-sm text-slate-300">Click to upload files</span>
            <span className="text-xs text-slate-500 mt-1">or drag and drop</span>
            <input
              type="file"
              multiple
              accept=".txt,.md,.csv,.json,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2">
                  <FileText size={14} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What happens next */}
        <div className="forge-card p-5 border-indigo-500/10">
          <h3 className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-4">What happens next</h3>
          <div className="space-y-3">
            {[
              { step: '1', label: 'Planning', desc: 'AI breaks your goal into steps and assigns specialized agents' },
              { step: '2', label: 'Execution', desc: 'Agents run using tools like web search, file reader, calculator' },
              { step: '3', label: 'Verification', desc: 'Result is verified for completeness and accuracy' },
              { step: '4', label: 'Delivery', desc: 'Final result + artifacts delivered to your dashboard' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-300">{label}</span>
                  <span className="text-xs text-slate-500 ml-2">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="forge-btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={createTask.isPending || !goal.trim()} className="forge-btn-primary flex-1 flex items-center justify-center gap-2">
            {createTask.isPending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting agent...</>
            ) : (
              <><Zap size={16} /> Run Agent</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
