import { useState } from 'react';
import {
  Zap,
  Github,
  Twitter,
  Linkedin,
  X,
  Shield,
  Sparkles,
  LayoutDashboard,
  Cpu,
  Bot,
  Code2,
  Users,
  Newspaper,
  Briefcase,
  Mail,
  FileText,
  Cookie,
  Lock,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

type FooterInfo = {
  title: string;
  icon: LucideIcon;
  description: string;
  details: string;
  email?: string;
};

const footerInfo: Record<string, FooterInfo> = {
  Features: {
    title: 'Features',
    icon: Sparkles,
    description:
      'Everything intelligent agents need to plan, execute, and deliver complex work.',
    details:
      'AgentForge provides multi-agent orchestration, dynamic planning, human-in-the-loop approvals, integrated tools, persistent memory, artifact generation, scheduled agents, and real-time execution.',
  },

  'How It Works': {
    title: 'How It Works',
    icon: Zap,
    description:
      'Turn complex goals into structured, executable workflows.',
    details:
      'AgentForge takes your goal, creates an execution plan, assigns specialized agents, runs the required tools, tracks progress in real time, and verifies results before delivering the final output.',
  },

  Security: {
    title: 'Security',
    icon: Shield,
    description:
      'Built with transparency, controlled execution, and human oversight in mind.',
    details:
      'AgentForge keeps execution visible through real-time activity streams and human approval controls. High-risk actions can pause for review before an agent continues.',
  },

  Pricing: {
    title: 'Pricing',
    icon: Zap,
    description:
      'Powerful autonomous agents without traditional per-token AI costs.',
    details:
      'AgentForge is designed around free OpenRouter models, allowing users to experiment with autonomous AI workflows without paying for every model token.',
  },

  Dashboard: {
    title: 'Dashboard',
    icon: LayoutDashboard,
    description:
      'A central workspace for managing and monitoring your autonomous agents.',
    details:
      'The AgentForge dashboard gives you visibility into active tasks, completed executions, generated artifacts, agent activity, and the live execution feed.',
  },

  'AI Models': {
    title: 'AI Models',
    icon: Cpu,
    description:
      'Automatically use the best available free OpenRouter model for each task. Login to see the Available AI models',
    details:
      'AgentForge uses intelligent model routing to select suitable free models based on the type of task being executed, with fallback handling when a model becomes unavailable.',
  },

  Agents: {
    title: 'Agents',
    icon: Bot,
    description:
      'Specialized agents collaborate to solve complex problems.',
    details:
      'AgentForge can coordinate specialized roles such as Researcher, Coder, Analyst, Security, and other task-specific agents instead of relying on one general-purpose agent.',
  },

  'API Docs': {
    title: 'API Documentation',
    icon: Code2,
    description:
      'Build integrations around AgentForge capabilities.',
    details:
      'The API documentation area is intended to provide developers with the information required to connect applications and workflows with AgentForge.',
  },

  About: {
    title: 'About AgentForge',
    icon: Users,
    description:
      'A production-grade multi-agent operating system for autonomous AI.',
    details:
      'AgentForge is built around real planning, real tool execution, persistent memory, real-time transparency, and human oversight — rather than simply providing another chat interface.',
  },

  Blog: {
    title: 'AgentForge Blog',
    icon: Newspaper,
    description:
      'Ideas, updates, experiments, and insights around autonomous AI.',
    details:
      'The AgentForge blog will cover product updates, autonomous agent architecture, AI tooling, workflow automation, and practical ways to build intelligent systems.',
  },

  Careers: {
    title: 'Careers',
    icon: Briefcase,
    description:
      'Help build the next generation of autonomous AI infrastructure.',
    details:
      'AgentForge is currently growing as a project. Future roles and opportunities will be listed here as the platform develops.',
  },

  Contact: {
    title: 'Contact AgentForge',
    icon: Mail,
    description:
      'Have a question, suggestion, or want to discuss AgentForge?',
    details:
      'Reach out directly through email. We would love to hear your feedback, ideas, or questions about the platform.',
    email: 'iamzohaib777@gmail.com',
  },

  'Privacy Policy': {
    title: 'Privacy Policy',
    icon: Lock,
    description:
      'Learn how information is handled when using AgentForge.',
    details:
      'We respect your privacy and are committed to protecting the information you provide while using AgentForge.Your data is handled responsibly and used only to provide, improve, and secure the platform.',
  },

  'Terms of Service': {
    title: 'Terms of Service',
    icon: FileText,
    description:
      'The terms governing use of the AgentForge platform.',
    details:
      'These terms define the rules and conditions for using AgentForge and its AI-powered features. By using the platform, you agree to use its services responsibly and in accordance with applicable laws.',
  },

  'Cookie Policy': {
    title: 'Cookie Policy',
    icon: Cookie,
    description:
      'Information about cookies and similar technologies.',
    details:
      'We process your personal information to measure and improve our sites and services, to assist our campaigns and to provide personalised content. ',
  },
};

export default function Footer() {
  const [activeFooter, setActiveFooter] = useState<string | null>(null);

  const activeInfo: FooterInfo | null = activeFooter
    ? footerInfo[activeFooter]
    : null;

  return (
    <>
      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-7xl mx-auto">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>

                <span className="font-display font-bold text-white">
                  AgentForge
                </span>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed">
                Autonomous AI agent platform for teams that build seriously.
              </p>

           <div className="flex gap-3 mt-5">
  <a
    href="https://github.com/zobbygit"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="GitHub"
    className="text-slate-500 hover:text-slate-300 transition-colors"
  >
    <Github size={18} />
  </a>

  <a
    href="/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Twitter"
    className="text-slate-500 hover:text-slate-300 transition-colors"
  >
    <Twitter size={18} />
  </a>

  <a
    href="https://www.linkedin.com/in/zohaib-aslam-245a40253"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="LinkedIn"
    className="text-slate-500 hover:text-slate-300 transition-colors"
  >
    <Linkedin size={18} />
  </a>
</div>
            </div>

            {/* Columns */}
            {[
              {
                title: 'Product',
                links: [
                  'Features',
                  'How It Works',
                  'Security',
                  'Pricing',
                ],
              },
              {
                title: 'Platform',
                links: [
                  'Dashboard',
                  'AI Models',
                  'Agents',
                  'API Docs',
                ],
              },
              {
                title: 'Company',
                links: [
                  'About',
                  'Blog',
                  'Careers',
                  'Contact',
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  {title}
                </h4>

                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => setActiveFooter(link)}
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors text-left"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} AgentForge. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                'Privacy Policy',
                'Terms of Service',
                'Cookie Policy',
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveFooter(item)}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Footer Popup */}
      {activeInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          onClick={() => setActiveFooter(null)}
        >
          <div className="absolute inset-0 bg-[#020617]/85 backdrop-blur-md" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="
              relative w-full max-w-lg overflow-hidden
              rounded-2xl
              border border-indigo-500/20
              bg-[#080d1a]
              shadow-[0_25px_80px_rgba(0,0,0,0.65)]
            "
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

            {/* Header */}
            <div className="relative flex items-start justify-between px-6 pt-6">
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-10 h-10 rounded-xl
                    border border-indigo-500/25
                    bg-indigo-500/[0.08]
                    flex items-center justify-center
                  "
                >
                  <activeInfo.icon
                    size={19}
                    className="text-indigo-400"
                  />
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-indigo-400 mb-1">
                    AgentForge
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {activeInfo.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveFooter(null)}
                aria-label="Close"
                className="
                  w-8 h-8 rounded-lg
                  border border-white/[0.07]
                  bg-white/[0.03]
                  flex items-center justify-center
                  text-slate-500
                  hover:text-white
                  hover:bg-white/[0.07]
                  transition-all
                "
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="relative px-6 pb-6 pt-6">
              <p className="text-[15px] leading-7 text-slate-300 mb-4">
                {activeInfo.description}
              </p>

              <div
                className="
                  rounded-xl
                  border border-white/[0.06]
                  bg-[#050914]
                  p-4
                "
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2
                    size={14}
                    className="text-indigo-400"
                  />

                  <span className="text-xs font-medium text-slate-300">
                    About this section
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-500">
                  {activeInfo.details}
                </p>
              </div>

              {/* Contact Email */}
              {activeInfo.email && (
                <a
                  href={`mailto:${activeInfo.email}`}
                  className="
                    mt-4 flex items-center gap-3
                    rounded-xl
                    border border-indigo-500/20
                    bg-indigo-500/[0.07]
                    px-4 py-3
                    text-sm text-indigo-300
                    hover:bg-indigo-500/[0.12]
                    hover:border-indigo-500/30
                    transition-all
                  "
                >
                  <Mail size={15} />
                  {activeInfo.email}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}