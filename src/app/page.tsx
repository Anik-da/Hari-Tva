"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Zap, Globe, Activity, Leaf, ArrowRight, MessageSquare,
  ChevronDown, Camera, Map, Sparkles, Check,
  Sliders, CheckCircle2, Trophy
} from "lucide-react";

// Safe dynamic import for WebGL ThreeGlobe component to prevent hydration blocks
const ThreeGlobe = dynamic(() => import("@/components/ThreeGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-72 h-72 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    </div>
  )
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const stagger: Variants = {
  show: { transition: { staggerChildren: 0.06 } }
};

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Carbon Simulator State
  const [solarPercent, setSolarPercent] = useState<number>(55);
  const [transitMiles, setTransitMiles] = useState<number>(25);
  const [dietIndex, setDietIndex] = useState<number>(1); // 0: Vegan, 1: Vegetarian, 2: Omnivore, 3: Carnivore
  const [simRating, setSimRating] = useState<number>(85);
  const [simCO2, setSimCO2] = useState<number>(8.4);

  useEffect(() => {
    // Recalculate simulator metrics in real time
    const baseTransit = transitMiles * 0.38; // gas vehicle co2 coef
    const baseEnergy = (1 - solarPercent / 100) * 11.2;
    const baseDiet = dietIndex === 0 ? 0.9 : dietIndex === 1 ? 1.5 : dietIndex === 2 ? 2.4 : 3.6;
    const computedCO2 = parseFloat((baseTransit + baseEnergy + baseDiet).toFixed(1));
    const computedScore = Math.max(10, Math.min(100, Math.round(100 - (computedCO2 * 2.4))));
    
    setSimCO2(computedCO2);
    setSimRating(computedScore);
  }, [solarPercent, transitMiles, dietIndex]);

  const faqs = [
    { q: "What is HariTva's AI Sustainability Operating System?", a: "HariTva is an integrated intelligence platform that helps individuals and enterprises catalog, simulate, and reduce their ecological impact through micro-metric tracking, real-time lifecycle calculations, and predictive modeling." },
    { q: "How is the Eco Score calculated?", a: "Your Eco Score (0-100) measures your net footprint based on energy efficiency, travel choices, food inputs, waste segregation, and community advocacy metrics relative to global science-based targets." },
    { q: "Can we connect real utility invoices?", a: "Yes. Our OCR electricity bill parser and receipt scanner analyze consumption logs and items to calculate direct carbon footprint values instantly using Gemini Vision model." },
    { q: "Is there support for high-contrast accessibility?", a: "Absolutely. HariTva meets WCAG 2.1 AA. Toggle High Contrast Mode in settings to maximize visibility." },
  ];

  const stats = [
    { title: "Grid Energy Offset", value: "320.4 MWh", sub: "Clean power replacement", icon: Zap, color: "text-[#34d399]" },
    { title: "Clean Miles Logged", value: "1.24 M mi", sub: "Electric rail & EV travels", icon: Globe, color: "text-sky-400" },
    { title: "Waste Diverted", value: "82.4 Tonnes", sub: "Recycled and processed locally", icon: Activity, color: "text-emerald-400" },
    { title: "Forest Equivalent", value: "48.2 k units", sub: "Net biological offset equivalent", icon: Leaf, color: "text-teal-400" },
  ];

  const leaders = [
    { rank: "01", name: "Aria Thorne", score: "96", co2: "-1.2 T/yr", av: "AT" },
    { rank: "02", name: "Devon Lane", score: "93", co2: "-0.9 T/yr", av: "DL" },
    { rank: "03", name: "Sarah Vance", score: "89", co2: "-0.7 T/yr", av: "SV" },
  ];

  return (
    <div className="relative min-h-screen bg-[#07090e] text-[#f3f4f6] selection:bg-emerald-500/20 selection:text-white grid-dots overflow-x-hidden">
      
      {/* Ambient background glow blooms */}
      <div className="glow-blob-green top-10 left-[-200px] opacity-40" />
      <div className="glow-blob-purple top-[35%] right-[-200px] opacity-25" />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07090e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-white uppercase font-sans">
              Hari<span className="text-emerald-500">Tva</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <a href="#stats" className="hover:text-emerald-400 transition-colors">Impact</a>
            <a href="#simulator" className="hover:text-emerald-400 transition-colors">Simulations</a>
            <a href="#toolkit" className="hover:text-emerald-400 transition-colors">Toolkit</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>
          <Link href="/dashboard" className="btn-cyber-primary px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer">
            Launch Platform
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-10 lg:py-16 flex items-center min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Text & Stats Column */}
          <motion.div className="lg:col-span-7 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left z-20 w-full" variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-emerald-400 rounded-full text-[10px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3" /> SUSTAINABLE FUTURE IN REAL TIME
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] tracking-tight text-white font-sans uppercase">
              The human-centered <br />
              <span className="text-gradient-neon">carbon intelligence</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed mx-auto lg:mx-0 font-normal">
              An elegant ecosystem to measure, simulate, and lower your carbon impact. Integrate utility bills, run carbon forecasts, and synchronize with your personal footprint twin.
            </motion.p>

            {/* Premium Stats Summary Panel */}
            <motion.div variants={fadeUp} className="glass-hud p-5 w-full max-w-lg mx-auto lg:mx-0 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Personal Carbon Status
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Sync
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Reduction Rate</span>
                  <span className="text-lg font-bold text-white mt-1 block">45.2%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Net Footprint</span>
                  <span className="text-lg font-bold text-white mt-1 block">1.2 T/yr</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-medium">Eco Rating</span>
                  <span className="text-lg font-bold text-emerald-400 mt-1 block">Grade A</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center lg:justify-start pt-1.5 w-full">
              <Link href="/dashboard" className="btn-cyber-primary px-6 py-3.5 rounded-xl text-xs uppercase flex items-center gap-2">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#simulator" className="btn-cyber-secondary px-6 py-3.5 rounded-xl text-xs uppercase flex items-center justify-center">
                Run Simulation
              </a>
            </motion.div>
          </motion.div>

          {/* Right Globe Column */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-4 lg:py-0 z-10 w-full max-w-[340px] lg:max-w-none mx-auto">
            <ThreeGlobe />
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section id="stats" className="py-20 border-y border-white/5 bg-black/10 px-6 sm:px-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">Global Progress</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">Verified ecological savings and carbon offsets cataloged across our system.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="glass-hud p-6 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                    <Icon className={`w-5.5 h-5.5 ${s.color}`} />
                  </div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">{s.title}</span>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CARBON SIMULATOR ── */}
      <section id="simulator" className="py-24 px-6 sm:px-8 relative z-20 bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">Carbon Simulator</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">Adjust your lifestyles variables and preview the simulated environmental rating adjustments instantly.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Control Panel */}
            <div className="lg:col-span-7 glass-hud p-6 sm:p-8 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5"><Sliders className="w-4 h-4" /> Parameters</span>
                  <span className="text-[9px] text-slate-500 uppercase">Interactive Modeler</span>
                </div>

                <div className="space-y-6">
                  {/* Solar range slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">Renewable Energy Share</span><span className="text-emerald-400">{solarPercent}%</span></div>
                    <input type="range" min="0" max="100" value={solarPercent} onChange={e => setSolarPercent(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>

                  {/* Driving distance slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">Daily commute miles</span><span className="text-emerald-400">{transitMiles} mi</span></div>
                    <input type="range" min="0" max="120" value={transitMiles} onChange={e => setTransitMiles(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>

                  {/* Diet buttons */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 block uppercase">Dietary Profile</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["Vegan", "Vegetarian", "Omnivore", "Carnivore"].map((label, idx) => (
                        <button key={idx} onClick={() => setDietIndex(idx)} 
                          className={`py-2 px-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${dietIndex === idx ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-white/5 text-slate-400 hover:border-slate-700"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0" />
                <p className="text-xs text-slate-400 leading-normal">Interactive modeling parameters update environmental rating metrics using carbon science databases.</p>
              </div>
            </div>

            {/* Readout card */}
            <div className="lg:col-span-5 glass-hud p-6 sm:p-8 flex flex-col justify-between text-center relative overflow-hidden">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1.5 font-semibold">Simulated Projection</span>
                <h4 className="text-xl font-bold text-white uppercase tracking-tight">Eco Health Score</h4>
              </div>

              <div className="my-8 flex flex-col items-center justify-center">
                {/* SVG Progress Circle Ring */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="transparent"
                      strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * simRating) / 100}
                      className="transition-all duration-500 ease-out" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{simRating}</span>
                    <span className="text-[9px] text-slate-450 uppercase tracking-wider font-semibold">Rating</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl border border-white/5 text-xs font-semibold">
                  <span className="text-slate-450">Daily Carbon Footprint</span>
                  <span className="text-white font-bold">{simCO2} kg CO2e</span>
                </div>
                <Link href="/dashboard" className="btn-cyber-primary w-full py-3.5 rounded-xl text-xs uppercase text-center block cursor-pointer">
                  Sync simulated state
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLKIT GRID ── */}
      <section id="toolkit" className="py-24 border-y border-white/5 bg-[#07090e]/80 px-6 sm:px-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-20">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">AI Sustainability Toolkit</h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">Elegant software modules solving global footprint measurement challenges.</p>
          </div>

          <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
            {/* Top Row */}
            <div className="flex flex-col lg:flex-row gap-8 w-full items-stretch">
              
              {/* Carbon Calculator */}
              <div className="w-full lg:w-2/3 glass-hud p-8 flex flex-col min-h-[280px]">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 font-semibold"><Zap className="w-3.5 h-3.5" /> EMISSIONS AUDITOR</span>
                    <h3 className="text-xl font-bold text-white uppercase">Carbon Calculator</h3>
                    <p className="text-xs sm:text-sm text-slate-450 max-w-sm mt-1">Detailed profiling of energy, daily transit, food, and aviation logs.</p>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl"><Zap className="w-5 h-5 text-indigo-400" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-auto">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-450 block uppercase text-[9px] font-semibold">Commute</span>
                    <span className="text-white font-bold block mt-1">120 mi / wk</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-450 block uppercase text-[9px] font-semibold">Utility Energy</span>
                    <span className="text-white font-bold block mt-1">340 kWh</span>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-400 block uppercase text-[9px] font-bold">Total Emissions</span>
                    <span className="text-emerald-300 font-bold block mt-1">4.2 Tonnes</span>
                  </div>
                </div>
              </div>

              {/* AI Mentor */}
              <div className="w-full lg:w-1/3 glass-hud p-8 flex flex-col min-h-[280px]">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 font-semibold"><MessageSquare className="w-3.5 h-3.5" /> PERSONALIZED CO-PILOT</span>
                <h3 className="text-xl font-bold text-white uppercase">AI Mentor</h3>
                <p className="text-xs sm:text-sm text-slate-450 mt-1">Chat workspace providing dynamic mitigation advisories to lower carbon indices.</p>
                
                <div className="mt-auto bg-white/5 p-4 rounded-xl border border-white/5 text-xs leading-relaxed text-slate-300">
                  <span className="text-emerald-400 block mb-1 text-[9px] font-semibold uppercase">Recommendation</span>
                  &quot;Transitioning domestic commutes to electric rail updates your eco-rating index by +12%.&quot;
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-col lg:flex-row gap-8 w-full items-stretch">
              
              {/* Product Scanner */}
              <div className="w-full lg:w-1/3 glass-hud p-8 flex flex-col justify-center items-center text-center min-h-[280px]">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5">
                  <Camera className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase">LCA Scanner</h3>
                <p className="text-xs text-slate-450 mb-5 max-w-xs">Scan products or receipts via computer vision to identify direct lifecycle ratings.</p>
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-4 py-2 border border-sky-500/25 rounded-xl w-full">GRADE A+ SUSTAINABLE</span>
              </div>

              {/* Travel Router */}
              <div className="w-full lg:w-2/3 glass-hud p-8 flex flex-col justify-between min-h-[280px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5 font-semibold"><Map className="w-3.5 h-3.5" /> ECO ROUTING</span>
                    <h3 className="text-xl font-bold text-white uppercase">Travel Router</h3>
                    <p className="text-xs sm:text-sm text-slate-450 mt-1">Real-time footprint comparison algorithms across global transit networks.</p>
                  </div>
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl"><Map className="w-5 h-5 text-emerald-400" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-auto">
                  <div>
                    <div className="flex justify-between mb-1.5"><span className="text-slate-450">High-Speed Transit</span><span className="text-emerald-400 font-bold">12 kg CO2</span></div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: "10%" }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5"><span className="text-slate-450">Commercial Aviation</span><span className="text-rose-400 font-bold">184 kg CO2</span></div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full" style={{ width: "85%" }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link href="/dashboard" className="btn-cyber-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs uppercase cursor-pointer">
              Launch platform command center <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DAILY MISSIONS ── */}
      <section className="py-24 px-6 sm:px-8 relative z-20 bg-black/10 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">Daily Missions</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">Complete actionable daily micro-tasks to establish continuous habits and improve your simulated carbon scores.</p>
            <Link href="/dashboard" className="btn-cyber-secondary px-5 py-3 rounded-xl text-xs uppercase inline-block">
              View Active Missions
            </Link>
          </div>
          <div className="w-full lg:w-1/2 space-y-3">
            {[
              { task: "De-energize standby home electronics", pts: "+100 pts", done: true },
              { task: "Adopt zero-plastic grocery workflows", pts: "+120 pts", done: true },
              { task: "Analyze utility invoice billing profiles", pts: "+150 pts", done: false }
            ].map((m, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex gap-3.5 items-center min-w-0">
                  <div className={`p-1 rounded-lg border flex-shrink-0 ${m.done ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/5 text-slate-500"}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">{m.task}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex-shrink-0">{m.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RANKINGS ── */}
      <section className="py-20 border-y border-white/5 bg-[#07090e]/80 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="w-full lg:w-5/12 space-y-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">Leaderboards</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">Benchmark your net footprint reductions against active municipal benchmarks to acquire certified community standings.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-450 text-[10px] font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> ISO-14064 COMPLIANT INDEX
            </div>
          </div>
          <div className="w-full lg:w-7/12 space-y-3">
            {leaders.map((l, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-xs font-semibold text-slate-500">{l.rank}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold flex-shrink-0">{l.av}</div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-white block truncate">{l.name}</span>
                    <span className="text-[10px] text-slate-450 block">{l.score} EcoScore</span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 flex-shrink-0">{l.co2}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-black/10 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="w-full lg:w-4/12 space-y-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">System FAQ</h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">Core configuration definitions. Consult our AI Mentor inside the platform for detailed guides.</p>
            <Link href="/dashboard" className="btn-cyber-secondary px-5 py-3 rounded-xl text-xs uppercase inline-block">
              Query AI Advisor
            </Link>
          </div>
          <div className="w-full lg:w-8/12 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-hud p-5">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex justify-between items-center text-left text-xs sm:text-sm font-semibold text-white hover:text-emerald-400 transition-colors uppercase tracking-tight">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${activeFaq === i ? "rotate-180 text-emerald-400" : ""}`} />
                </button>
                {activeFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-slate-350 leading-relaxed pt-4 mt-4 border-t border-white/5">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTIVE AI MODELS STATUS PANEL ── */}
      <section className="py-16 px-6 sm:px-8 border-t border-white/5 bg-[#07090e]/50">
        <div className="max-w-4xl mx-auto glass-hud p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">AI Engine Powered by Hugging Face</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              We leverage premium serverless open-weights models optimized for high-performance reasoning, natural language translation, and complex computer vision.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {[
              { name: "Qwen 2.5 7B Instruct", role: "AI Mentor & Advisor", status: "Active & Latency Optimized" },
              { name: "Qwen 2 VL 7B Instruct", role: "OCR & Document Analysis", status: "Active & GPU Accelerated" },
              { name: "BLIP Image Captioning", role: "Fallback Vision Classifier", status: "Active & Cold-Standby ready" }
            ].map((m, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase block">{m.role}</span>
                  <h4 className="text-xs font-bold text-white mt-1 uppercase">{m.name}</h4>
                </div>
                <div className="flex items-center justify-center gap-1.5 pt-2 text-[8px] font-extrabold text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {m.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-white/5 text-center space-y-4 text-slate-500 bg-black/40">
        <div className="flex justify-center items-center gap-2">
          <Leaf className="text-emerald-500 w-5 h-5" />
          <span className="text-sm font-bold tracking-tight text-white uppercase">HariTva Platform</span>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">© {new Date().getFullYear()} HariTva Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
