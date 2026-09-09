import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Brain, Shield, Globe, Code2, Cpu, ArrowRight,
  CheckCircle2, Star, ChevronRight, Layers, BarChart3,
  MessageSquare, FileText, Calendar, Users, Lock, Server,
  Github, Twitter, Linkedin, Play, Sparkles, Bot, Network,
  Activity, Database, Eye
} from 'lucide-react';
import Footer from '../footer/Footer';
import Faq from './Faq';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FEATURES = [
  { icon: Brain, title: 'Multi-Agent Orchestration', desc: 'Specialized agents—Researcher, Coder, Analyst, Security—collaborate in real-time to solve complex tasks with intelligent task decomposition.' },
  { icon: Network, title: 'Dynamic Planning Engine', desc: 'AI-powered planner breaks goals into executable steps, assigns optimal agents, handles dependencies, and adapts plans in real-time.' },
  { icon: Shield, title: 'Human-in-the-Loop Approvals', desc: 'High-risk actions pause for your review. Approve, reject, or modify agent actions before execution with full transparency.' },
  { icon: Globe, title: '9+ Integrated Tools', desc: 'Web search, PDF reader, CSV analyzer, code executor, browser automation, JSON processor, calculator and more—all secured.' },
  { icon: Cpu, title: 'Free AI Model Routing', desc: 'Automatically selects the best free OpenRouter model per task type. Seamless fallback chain ensures zero downtime.' },
  { icon: Calendar, title: 'Scheduled Agents', desc: '"Every Monday, analyze my GitHub project." Background scheduler runs agents on your timeline without keeping browser open.' },
  { icon: Database, title: 'Persistent Memory', desc: 'Short-term, long-term and project-scoped memory. Agents remember context across sessions for increasingly powerful results.' },
  { icon: FileText, title: 'Artifact Generation', desc: 'Agents generate Markdown reports, JSON data, CSV exports, code files, and more—all versioned and downloadable.' },
  { icon: Activity, title: 'Real-Time Execution', desc: 'Live Socket.IO streaming shows every step: planning, tool calls, agent switches, and verification as they happen.' },
];

const TESTIMONIALS = [
  { name: 'Priya Kapoor', role: 'CTO, TechScale', avatar: 'PK', text: 'AgentForge replaced three manual research workflows. Our team deploys agents for competitive analysis, and the results are indistinguishable from analyst output.', rating: 5 },
  { name: 'Marcus Chen', role: 'Lead Engineer, DataFlow', avatar: 'MC', text: 'The approval system is what sold us. We run code-generation agents with full confidence because nothing executes without human sign-off.', rating: 5 },
  { name: 'Aisha Rahman', role: 'Product Manager, NovaBuild', avatar: 'AR', text: 'Scheduled agents have transformed our Monday mornings. Sales summaries, GitHub changelogs, and competitor alerts all arrive automatically.', rating: 5 },
  { name: 'Dmitri Volkov', role: 'Founder, AIStudio', avatar: 'DV', text: 'The memory system is exceptional. Agents now understand our entire codebase context after one setup session—completely changed how we build.', rating: 5 },
  { name: 'Seo-yeon Park', role: 'Data Scientist, Nexus', avatar: 'SP', text: 'Free model routing with intelligent fallback means we get GPT-4 level results without the cost. The task routing is impressively accurate.', rating: 5 },
  { name: 'Jordan Wells', role: 'DevOps Lead, CoreSystems', avatar: 'JW', text: 'The audit logs give us everything compliance needs. Every agent action, tool call, and model selection is timestamped and traceable.', rating: 5 },
];

const WORKFLOW_STEPS = [
  { icon: MessageSquare, title: 'Define Your Goal', desc: 'Describe what you want in plain English. No code, no config.' },
  { icon: Brain, title: 'AI Plans the Approach', desc: 'The planner decomposes your goal into ordered, dependency-aware steps.' },
  { icon: Bot, title: 'Agents Execute', desc: 'Specialized agents run in parallel, using the right tools for each step.' },
  { icon: Eye, title: 'You Stay in Control', desc: 'Approve risky actions, monitor live progress, and get the final result.' },
];

const TRUST_ITEMS = [
  { icon: Lock, title: 'Zero API key exposure', desc: 'All model calls proxy through the backend. Your OpenRouter key never touches the browser.' },
  { icon: Shield, title: 'Role-based access control', desc: 'USER and ADMIN roles with route-level enforcement on every endpoint.' },
  { icon: FileText, title: '90-day audit logs', desc: 'Immutable, append-only audit trail for every action—users cannot delete logs.' },
  { icon: Server, title: 'Sandbox code execution', desc: 'All code runs in an isolated environment, never touching your production backend.' },
  { icon: Eye, title: 'Full transparency', desc: 'Every model selection, tool call, and fallback is surfaced to the user in real-time.' },
  { icon: Database, title: 'Memory isolation', desc: 'Per-user memory with optional project scoping. No cross-user data leakage.' },
];

const AGENT_TYPES = ['Orchestrator', 'Researcher', 'Analyst', 'Coder', 'Security', 'Document', 'Reviewer', 'Business'];
// const navigate=useNavigate()
export default function LandingPage() {

  return (
    <div className="min-h-screen bg-[#050A18] text-slate-200 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050A18]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">AgentForge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Agents', 'Testimonials', 'Security'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
              Log in
            </Link>
            <Link to="/register" className="forge-btn-primary text-sm py-2 px-5">
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="orb w-[600px] h-[600px] bg-indigo-600 top-[-200px] left-[-200px]" />
        <div className="orb w-[400px] h-[400px] bg-cyan-500 top-[100px] right-[-100px]" />
        <div className="orb w-[300px] h-[300px] bg-violet-600 bottom-[-100px] left-[30%]" />
        <div className="absolute inset-0 grid-bg" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
              <Sparkles size={12} />
              Powered by free OpenRouter models — no cost, full power
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          >
            Autonomous AI Agents<br />
            <span className="gradient-text">That Actually Work</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AgentForge orchestrates specialized AI agents to plan, execute, and deliver on complex goals—
            with real-time transparency, human approval controls, and persistent memory.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/register" className="forge-btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              Start for free <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="forge-btn-secondary inline-flex items-center gap-2 text-base px-8 py-4">
              <Play size={16} className="text-indigo-400" /> See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-500"
          >
            {['No credit card required', '9+ built-in tools', 'Free AI models', 'Open source ready'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-indigo-400" /> {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Hero product preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }}
          className="relative max-w-5xl mx-auto mt-16"
        >
          <div className="forge-card overflow-hidden border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
            <div className="bg-[#0a1020] border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-slate-500 ml-2 font-mono">agentforge.ai / dashboard / tasks</span>
              <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
              </div>
            </div>
            <div className="p-6 bg-[#060b17]">
              {/* Simulated task execution UI */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[['Active Tasks', '3', 'text-cyan-400'], ['Completed', '47', 'text-green-400'], ['Artifacts', '128', 'text-violet-400']].map(([label, val, color]) => (
                  <div key={label} className="forge-card px-4 py-3">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold font-display ${color}`}>{val}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { goal: 'Analyze competitor pricing strategy and generate report', agent: 'Researcher', status: 'completed', steps: 6 },
                  { goal: 'Write and review unit tests for authentication module', agent: 'Coder', status: 'running', steps: 4 },
                  { goal: 'Summarize Q3 sales CSV and identify top performers', agent: 'Analyst', status: 'planning', steps: 0 },
                ].map((task, i) => (
                  <div key={i} className="forge-card px-4 py-3 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.status === 'completed' ? 'bg-green-400' :
                      task.status === 'running' ? 'bg-cyan-400 animate-pulse' : 'bg-indigo-400 animate-pulse'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{task.goal}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.agent} agent · {task.steps} steps</p>
                    </div>
                    <span className={`status-badge text-xs ${
                      task.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      task.status === 'running' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
              {/* Live execution ticker */}
              <div className="mt-4 bg-black/40 rounded-xl px-4 py-3 font-mono text-xs space-y-1.5">
                <p className="text-slate-500">// live execution feed</p>
                <p><span className="text-cyan-400">[Researcher]</span> <span className="text-slate-400">→ web_search("competitor pricing AI tools 2025")</span></p>
                <p><span className="text-green-400">[Tool]</span> <span className="text-slate-400">web_search completed · 8 sources found</span></p>
                <p><span className="text-indigo-400">[Analyst]</span> <span className="text-slate-400">→ synthesizing findings into structured report...</span></p>
                <p><span className="text-violet-400">[Verification]</span> <span className="text-slate-400">→ checking result completeness... confidence: 94%</span></p>
              </div>
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-indigo-500/20 blur-2xl rounded-full" />
        </motion.div>
      </section>

      {/* Agent types carousel */}
      <section id="agents" className="py-16 border-y border-white/[0.05] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <FadeIn><p className="text-sm text-slate-500 uppercase tracking-widest font-medium">Specialized Agent Types</p></FadeIn>
        </div>
        <div className="flex gap-4 animate-[scroll_30s_linear_infinite] w-max">
          {[...AGENT_TYPES, ...AGENT_TYPES].map((agent, i) => (
            <div key={i} className="forge-card px-5 py-3 flex items-center gap-2.5 flex-shrink-0">
              <Bot size={15} className="text-indigo-400" />
              <span className="text-sm font-medium text-slate-300">{agent}</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-indigo-400 text-sm font-medium uppercase tracking-widest">How It Works</span>
            <h2 className="font-display text-4xl font-bold mt-3 mb-4">From goal to result in minutes</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">One natural language goal triggers a full agent workflow. No code, no config, no babysitting.</p>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-6">
            {WORKFLOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="forge-card-hover p-6 relative">
                  <div className="absolute top-4 right-4 font-display text-5xl font-bold text-white/[0.03] leading-none">{i + 1}</div>
                  <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-5">
                    <Icon size={20} className="text-indigo-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  {i < 3 && <ChevronRight size={16} className="absolute top-1/2 -right-3 text-indigo-500/40 hidden md:block" />}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#030710]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-indigo-400 text-sm font-medium uppercase tracking-widest">Features</span>
            <h2 className="font-display text-4xl font-bold mt-3 mb-4">Everything intelligent agents need</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Production-grade infrastructure for autonomous AI, not a toy demo.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="forge-card-hover p-6 group h-full">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:border-indigo-500/40 transition-colors">
                    <Icon size={18} className="text-indigo-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow showcase */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <span className="text-cyan-400 text-sm font-medium uppercase tracking-widest">Live Execution</span>
              <h2 className="font-display text-4xl font-bold mt-3 mb-6">Watch agents work in real time</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Every step streamed live via WebSocket. See which agent is active, which tools it's calling,
                and what model it selected—all in a beautiful timeline with zero lag.
              </p>
              <ul className="space-y-4">
                {['Live agent-step timeline with Socket.IO', 'Tool execution with input/output visibility', 'Model selection reasoning shown clearly', 'Approval requests surface immediately'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={17} className="text-indigo-400 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="forge-btn-primary inline-flex items-center gap-2 mt-8">
                Try live now <ArrowRight size={16} />
              </Link>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="forge-card p-0 overflow-hidden border-indigo-500/20">
                <div className="bg-[#080d1c] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Execution Timeline</span>
                  <span className="flex items-center gap-1.5 text-xs text-green-400"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Running</span>
                </div>
                <div className="p-5 space-y-3 font-mono text-xs">
                  {[
                    { time: '00:00', event: 'task.started', color: 'text-slate-400', icon: '▶' },
                    { time: '00:01', event: 'plan.created · 5 steps · Reasoning model', color: 'text-indigo-400', icon: '🧠' },
                    { time: '00:02', event: 'agent.started · Researcher', color: 'text-cyan-400', icon: '🤖' },
                    { time: '00:03', event: 'tool.started · web_search("AI trends 2025")', color: 'text-yellow-400', icon: '🔍' },
                    { time: '00:05', event: 'tool.completed · 8 sources found', color: 'text-green-400', icon: '✓' },
                    { time: '00:06', event: 'agent.started · Analyst', color: 'text-cyan-400', icon: '🤖' },
                    { time: '00:08', event: 'artifact.created · Research_Report.md', color: 'text-violet-400', icon: '📄' },
                    { time: '00:10', event: 'verification.completed · confidence: 96%', color: 'text-green-400', icon: '✅' },
                    { time: '00:10', event: 'task.completed', color: 'text-green-400', icon: '🎉' },
                  ].map(({ time, event, color, icon }) => (
                    <div key={time} className="flex items-start gap-3">
                      <span className="text-slate-600 w-10 flex-shrink-0">{time}</span>
                      <span>{icon}</span>
                      <span className={color}>{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[#030710]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-indigo-400 text-sm font-medium uppercase tracking-widest">Testimonials</span>
            <h2 className="font-display text-4xl font-bold mt-3 mb-4">Trusted by builders</h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, avatar, text, rating }, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="forge-card-hover p-6 flex flex-col h-full">
                  <div className="flex gap-0.5 mb-4">
                    {Array(rating).fill(null).map((_, j) => (
                      <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed flex-1">"{text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/[0.06]">
                    <div className="w-9 h-9 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="text-xs text-slate-500">{role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-indigo-400 text-sm font-medium uppercase tracking-widest">Security</span>
            <h2 className="font-display text-4xl font-bold mt-3 mb-4">Built with security-first principles</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Every design decision made with the assumption that AI agents must be constrained, transparent, and auditable.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="forge-card p-6 border-indigo-500/10 hover:border-indigo-500/25 transition-colors">
                  <Icon size={20} className="text-indigo-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 bg-[#030710]">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <span className="text-indigo-400 text-sm font-medium uppercase tracking-widest">About</span>
            <h2 className="font-display text-4xl font-bold mt-3 mb-6">Why AgentForge?</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Most "AI agent" products are glorified chat interfaces. AgentForge is different: it's a production-grade 
              multi-agent operating system with real planning, real tool execution, real memory, and real oversight.
            </p>
            <p className="text-slate-400 text-lg leading-relaxed">
              Built on free OpenRouter models, anyone can deploy powerful autonomous agents without paying per-token costs. 
              The intelligent model router ensures the best available free model is always selected for your task type.
            </p>
            <div className="grid grid-cols-3 gap-8 mt-16">
              {[['9+', 'Built-in Tools'], ['8', 'Agent Types'], ['Free', 'AI Models']].map(([val, label]) => (
                <div key={label}>
                  <p className="font-display text-4xl font-bold gradient-text">{val}</p>
                  <p className="text-slate-400 mt-1 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>



<Faq/>


      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="orb w-[500px] h-[500px] bg-indigo-600 top-[-200px] left-[-200px]" />
        <div className="orb w-[400px] h-[400px] bg-cyan-500 bottom-[-200px] right-[-100px]" />
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-display text-5xl font-bold mb-6">
              Start building with<br /><span className="gradient-text">autonomous AI agents</span>
            </h2>
            <p className="text-slate-400 text-xl mb-10">Free to start. No credit card. Deploy agents in minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="forge-btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
                Create free account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="forge-btn-secondary inline-flex items-center gap-2 text-lg px-10 py-4">
                Sign in
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="font-display font-bold text-white">AgentForge</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Autonomous AI agent platform for teams that build seriously.</p>
              <div className="flex gap-3 mt-5">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'How It Works', 'Security', 'Pricing'] },
              { title: 'Platform', links: ['Dashboard', 'AI Models', 'Agents', 'API Docs'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} AgentForge. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a key={item} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer> */}
      <Footer/>
    </div>
  );
}
