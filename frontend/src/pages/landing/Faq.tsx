import React, { useState } from "react";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

const faqs = [
  {
    question: "Is AgentForge completely free to use?",
    answer:
      "Yes. AgentForge is completely free to use with no paid plans or subscriptions. It uses available free OpenRouter AI models.",
  },
  {
    question: "What can I do with AgentForge?",
    answer:
      "• Create and run autonomous AI agents for complex tasks.\n• Let agents plan, execute tools, collaborate, and verify results.",
  },
  {
    question: "Can I save and download my work?",
    answer:
      "• Yes. AgentForge can save your generated work and artifacts.\n• You can download outputs such as reports, files, JSON, CSV, and other generated artifacts.",
  },
  {
    question: "Can I create a workspace?",
    answer:
      "• Yes. You can create a workspace to organize your projects and agent activity.\n• Workspaces keep related tasks, agents, and generated work together.",
  },
  {
    question: "Can I schedule agents or reminders?",
    answer:
      "• Yes. AgentForge supports scheduled agents and reminders.\n• You can schedule recurring tasks so agents can run automatically at the selected time.",
  },
  {
    question: "How does AgentForge handle AI models?",
    answer:
      "• AgentForge uses OpenRouter to access available free AI models.\n• An admin can manage the models available to the platform.",
  },
  {
    question: "Does AgentForge support different types of agents?",
    answer:
      "• Yes. AgentForge uses specialized agents for different types of work.\n• Agents can handle tasks such as research, coding, analysis, security, and other workflows.",
  },
  {
    question: "What makes AgentForge different?",
    answer:
      "• AgentForge is built around autonomous execution rather than simple AI chat.\n• It combines planning, tools, memory, scheduling, artifacts, real-time execution, and human oversight in one platform.",
  },
];

  return (
    <>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

          .agentforge-faq,
          .agentforge-faq * {
            font-family: "Poppins", sans-serif;
          }
        `}
      </style>

      <section className="agentforge-faq relative w-full overflow-hidden bg-[#020617] py-20 px-4 sm:px-6">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-5xl">
          {/* Header */}
          <div className="mb-12 flex flex-col items-center text-center">
      <span className="mb-3 text-xl font-medium uppercase tracking-[0.25em] leading-6 text-indigo-400">
  FAQ
</span>

            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Most asked{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                FAQs
              </span>
            </h2>

            <p className="max-w-xl text-sm leading-6 text-slate-400 sm:text-[15px]">
              We're here to help you and solve doubts. Find answers to the
              most common questions below.
            </p>
          </div>

          {/* FAQ Grid */}
   <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-4 gap-y-4">
  {faqs.map((faq, index) => {
    const isOpen = openIndex === index;

    return (
      <div
        key={index}
        onClick={() => toggleFAQ(index)}
        className={`
          group cursor-pointer overflow-hidden rounded-xl
          border transition-all duration-300
          ${
            isOpen
              ? "border-indigo-500/30 bg-[#0b1120] shadow-[0_0_30px_rgba(99,102,241,0.07)]"
              : "border-white/[0.07] bg-[#080d18] hover:border-indigo-500/20 hover:bg-[#0a101d]"
          }
        `}
      >
        {/* Question */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <span
            className={`
              text-sm font-medium transition-colors duration-300
              ${
                isOpen
                  ? "text-white"
                  : "text-slate-300 group-hover:text-white"
              }
            `}
          >
            {faq.question}
          </span>

          {/* Plus / Minus */}
          <div
            className={`
              flex h-7 w-7 shrink-0 items-center justify-center
              rounded-lg border transition-all duration-300
              ${
                isOpen
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-500 group-hover:border-indigo-500/20 group-hover:text-indigo-400"
              }
            `}
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            )}
          </div>
        </div>

        {/* Answer */}
        <div
          className={`
            grid transition-all duration-300 ease-in-out
            ${
              isOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }
          `}
        >
          <div className="overflow-hidden">
            <div className="border-t border-white/[0.05] px-5 pb-5 pt-4">
              <p className="whitespace-pre-line text-sm leading-6 text-slate-500">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>
        </div>
      </section>
    </>
  );
}