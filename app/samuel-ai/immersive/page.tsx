"use client";

import Link from "next/link";
import { Activity, BrainCircuit, Globe2, Mail, Mic, Radar, Sparkles, Target, Workflow } from "lucide-react";
import { useMemo } from "react";

const modules = [
  { label: "Revenue", detail: "Oportunidades e pipeline", href: "/revenue", icon: Target },
  { label: "Radar", detail: "Descoberta de leads", href: "/revenue/radar", icon: Radar },
  { label: "Sites", detail: "Criação premium", href: "/samuel-ai", icon: Globe2 },
  { label: "Inbox", detail: "Respostas e prioridades", href: "/revenue/inbox", icon: Mail },
] as const;

export default function SamuelImmersivePage() {
  const particles = useMemo(() => Array.from({ length: 46 }, (_, i) => ({
    id: i, left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, delay: `${(i % 11) * -.7}s`, duration: `${8 + (i % 9)}s`, size: 1 + (i % 3), opacity: .16 + (i % 5) * .08,
  })), []);

  return <main className="relative min-h-screen overflow-hidden bg-[#050607] text-white">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute left-1/2 top-[34%] h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[.035] blur-3xl" />
      {particles.map(p => <i key={p.id} className="absolute rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.55)] motion-safe:animate-pulse" style={{left:p.left,top:p.top,width:p.size,height:p.size,opacity:p.opacity,animationDelay:p.delay,animationDuration:p.duration}} />)}
    </div>

    <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 md:px-10">
      <header className="flex items-center justify-between border-b border-white/[.07] pb-5">
        <div><p className="text-[10px] uppercase tracking-[.32em] text-white/35">SF Growth AI</p><p className="mt-1 text-sm font-medium text-white/75">Samuel Command Center</p></div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-xs text-white/55"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]" /> Online</div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        <div className="relative flex size-64 items-center justify-center sm:size-80">
          <div className="absolute inset-0 rounded-full border border-white/[.06] motion-safe:animate-[spin_28s_linear_infinite]" />
          <div className="absolute inset-8 rounded-full border border-dashed border-white/[.12] motion-safe:animate-[spin_18s_linear_infinite_reverse]" />
          <div className="absolute inset-16 rounded-full bg-white/[.035] blur-xl" />
          <div className="relative flex size-28 items-center justify-center rounded-full border border-white/20 bg-white/[.07] shadow-[0_0_70px_rgba(255,255,255,.12),inset_0_0_35px_rgba(255,255,255,.08)] backdrop-blur-xl sm:size-36">
            <BrainCircuit className="size-11 text-white/85 sm:size-14" strokeWidth={1.15} />
            <span className="absolute inset-[-10px] rounded-full border border-white/[.08] motion-safe:animate-ping [animation-duration:3.8s]" />
          </div>
        </div>

        <p className="mt-3 text-[10px] uppercase tracking-[.38em] text-white/30">Inteligência operacional</p>
        <h1 className="mt-3 text-3xl font-medium tracking-[-.04em] sm:text-5xl">Fale. Samuel organiza a execução.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">Uma interface para conversar, analisar e acionar os módulos reais do SF Growth AI. A atividade só é apresentada como executada quando existe backend correspondente.</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/samuel-ai" className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"><Mic className="size-4" /> Falar com Samuel</Link>
          <Link href="/revenue" className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[.045] px-5 py-3 text-sm text-white/75 backdrop-blur-xl"><Workflow className="size-4" /> Abrir Revenue Agent</Link>
        </div>
      </section>

      <section className="grid gap-3 pb-8 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map(module => <Link key={module.label} href={module.href} className="group rounded-2xl border border-white/[.08] bg-white/[.025] p-4 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[.055]">
          <module.icon className="size-5 text-white/55" strokeWidth={1.4}/><p className="mt-4 text-sm font-medium">{module.label}</p><p className="mt-1 text-xs text-white/35">{module.detail}</p>
        </Link>)}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[.07] py-4 text-[10px] uppercase tracking-[.18em] text-white/25"><span className="flex items-center gap-2"><Activity className="size-3"/> Supervisionado</span><span className="flex items-center gap-2"><Sparkles className="size-3"/> Neutral luminous interface</span></footer>
    </div>
  </main>;
}
