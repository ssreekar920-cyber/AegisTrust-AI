import React, { useState } from "react";
import {
  Sparkles,
  Shield,
  Star,
  Users,
  Linkedin,
  Copy,
  Check,
  ExternalLink,
  Award,
  Terminal,
  Lock,
  DollarSign,
  Cpu,
  Globe,
  Compass,
  ArrowRight,
  Code2,
  Rocket,
} from "lucide-react";

export function AboutUs({ onNavigate }) {
  const [copiedLink, setCopiedLink] = useState(null);

  // Exact Team Members provided by user: Name, Roll Number, and LinkedIn URL
  const teamMembers = [
    {
      id: 1,
      name: "SK.RAHIM",
      role: "Team Leader",
      rollNo: "N25G01A0037",
      badge: "TEAM LEADER",
      callsign: "STARS-LEAD",
      linkedin: "https://www.linkedin.com/in/shaik-rahim-893862363",
      displayUrl: "linkedin.com/in/shaik-rahim-893862363",
      color: "#06b6d4", // Cyan
    },
    {
      id: 2,
      name: "Yv Charan teja",
      role: "Member 1",
      rollNo: "N25G01A0003",
      badge: "MEMBER 1",
      callsign: "STARS-01",
      linkedin: "https://www.linkedin.com/in/yv-charan-teja-64310b384",
      displayUrl: "linkedin.com/in/yv-charan-teja-64310b384",
      color: "#10b981", // Emerald
    },
    {
      id: 3,
      name: "Tholeti Venkata Hari Sai Sreekar",
      role: "Member 2",
      rollNo: "N25G01A0132",
      badge: "MEMBER 2",
      callsign: "STARS-02",
      linkedin: "https://www.linkedin.com/in/harisaisreekar",
      displayUrl: "linkedin.com/in/harisaisreekar",
      color: "#f59e0b", // Amber
    },
  ];

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Team STARS Cosmic Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-6 shadow-[0_0_24px_rgba(6,182,212,0.3)]">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="font-bold tracking-wider">TEAM STARS · SOVEREIGN AI SECURITY & TRUST</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Pioneering the Cosmic Frontiers of{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            AI Security, Privacy & Integrity
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
          We are <strong className="text-white font-bold">Team STARS</strong> — an elite collective of cybersecurity researchers,
          cryptographers, and AI engineers. We designed <strong className="text-cyan-400">AegisTrust AI</strong> to resolve the
          real-world crisis of sensitive data leakage, stealth malware in cloud files, and sophisticated wire fraud in generative AI systems.
        </p>
      </div>

      {/* Team STARS Member Cards Grid (Name, Roll Number & LinkedIn URL Only) */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Meet Team STARS Roster</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Official team members, student credentials, and verified LinkedIn profiles
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-semibold">
            {teamMembers.length} CREW MEMBERS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative rounded-2xl bg-[#0b1220]/95 border border-slate-800 hover:border-cyan-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.2)] hover:-translate-y-1 backdrop-blur-md"
              style={{ "--member-accent": member.color }}
            >
              {/* Top Header Badge & Callsign */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border"
                    style={{
                      backgroundColor: `${member.color}15`,
                      borderColor: `${member.color}50`,
                      color: member.color,
                    }}
                  >
                    {member.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">{member.callsign}</span>
                </div>

                {/* Celestial Avatar & Member Details */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-lg relative overflow-hidden border shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${member.color}35, #020617)`,
                      borderColor: `${member.color}70`,
                    }}
                  >
                    <Star className="w-6 h-6" style={{ color: member.color }} />
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${member.color}, transparent 70%)`,
                      }}
                    />
                  </div>

                  <div className="overflow-hidden">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {member.role}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[11px] font-mono font-bold">
                      <span>Roll No:</span>
                      <span className="text-white">{member.rollNo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LinkedIn URL Section */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0077b5]/15 hover:bg-[#0077b5]/25 border border-[#0077b5]/40 hover:border-[#0077b5] text-[#38bdf8] text-xs font-mono font-semibold transition-all group/btn"
                    title={`Open ${member.name}'s LinkedIn Profile`}
                  >
                    <Linkedin className="w-4 h-4 text-[#0077b5] fill-[#0077b5] shrink-0" />
                    <span className="truncate">{member.displayUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70 group-hover/btn:opacity-100 shrink-0" />
                  </a>

                  <button
                    onClick={() => handleCopyLink(member.linkedin, member.id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer shrink-0"
                    title="Copy LinkedIn URL"
                  >
                    {copiedLink === member.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* S.T.A.R.S. Mission Acronym Section */}
      <section className="mb-20 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-md">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            THE S.T.A.R.S. DOCTRINE
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Five Principles Powering Our Sovereign Defense
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every layer of AegisTrust AI maps directly to the founding values of Team STARS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              letter: "S",
              word: "Sovereign Threat Defense",
              desc: "Autonomous AST heuristic inspection that neutralizes trojans, backdoors, and reverse shells without third-party exposure.",
              icon: Shield,
              color: "#06b6d4",
            },
            {
              letter: "T",
              word: "Transparent Governance",
              desc: "Cryptographically linked SHA-256 audit ledger and NIST AI RMF 1.0 scoring guaranteeing non-repudiation and explainable AI.",
              icon: Award,
              color: "#38bdf8",
            },
            {
              letter: "A",
              word: "Autonomous Interception",
              desc: "Sub-15ms threat interception and automated bank wire freezes halting BEC financial fraud in real time.",
              icon: Rocket,
              color: "#f59e0b",
            },
            {
              letter: "R",
              word: "Reversible Zero-Knowledge",
              desc: "Replaces confidential PII and secrets with decoupled synthetic tokens, guaranteeing models cannot leak private data.",
              icon: Lock,
              color: "#10b981",
            },
            {
              letter: "S",
              word: "Scalable Multi-Cloud Grid",
              desc: "Live synchronization and deep quarantine across Google Drive, Gmail, Outlook 365, GitHub, Slack, and AWS S3.",
              icon: Globe,
              color: "#8b5cf6",
            },
          ].map((principle, idx) => {
            const Icon = principle.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl font-mono mb-4 border"
                    style={{
                      backgroundColor: `${principle.color}15`,
                      borderColor: `${principle.color}40`,
                      color: principle.color,
                    }}
                  >
                    {principle.letter}
                  </div>
                  <h3 className="font-bold text-white text-sm mb-2">{principle.word}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{principle.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Arsenal & Project Genesis */}
      <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Genesis */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0c1328] to-[#020617] border border-cyan-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-2">
              <Compass className="w-4 h-4" />
              <span>Project Genesis</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Why Team STARS Built AegisTrust AI</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              When generative AI tools and multi-cloud collaboration suites entered enterprise workflows, traditional perimeter firewalls failed:
            </p>
            <ul className="space-y-3 text-xs text-slate-300 font-mono mb-6">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">01.</span>
                <span>Employees innocently pasted sensitive customer SSNs and cloud keys into chat prompts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">02.</span>
                <span>Cybercriminals used lookalike executive emails to alter wire routing numbers in fake invoices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">03.</span>
                <span>Adversaries weaponized open-source npm/pip packages with silent reverse shells.</span>
              </li>
            </ul>
            <p className="text-sm text-slate-300 leading-relaxed">
              Team STARS engineered AegisTrust AI to unite these fragmented problems into a single, unified, sovereign defense shield.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400">STATUS: PRODUCTION-READY</span>
            <button
              onClick={() => onNavigate("chatbot")}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Test with Defense Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tech Stack Arsenal */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0c1328] to-[#020617] border border-cyan-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase mb-2">
              <Code2 className="w-4 h-4" />
              <span>Engineering Arsenal</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">The Technologies Fueling AegisTrust</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { name: "Google Gemini 3.1 Flash-Lite", role: "Hardened Blue-Team Defense Advisor" },
                { name: "Zero-Knowledge AST Tokenizer", role: "PII Decoupling & ZK Hash Proofs" },
                { name: "Cryptographic SHA-256 Chain", role: "Immutable Non-Repudiable Ledger" },
                { name: "Static Heuristic Scanner", role: "Trojan & Reverse Shell Interception" },
                { name: "React 18 + Canvas Motion 2D", role: "Stellar Cyber Visual Experience" },
                { name: "Express + In-Memory Mongo", role: "Resilient Sub-15ms Gateway API" },
              ].map((tech, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="font-bold text-xs text-white">{tech.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tech.role}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-400">STANDARDS: NIST AI RMF 1.0</span>
            <button
              onClick={() => onNavigate("dashboard")}
              className="text-xs font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
            >
              <span>View Governance Scorecard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <div className="text-center py-8">
        <p className="text-xs font-mono text-slate-400">
          Crafted with sovereign pride by <strong className="text-white">Team STARS</strong> for AI Security, Privacy & Trust.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;
