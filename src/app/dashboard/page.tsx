"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useDashboard } from "@/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Utensils, Trash2, Camera, FileText, AlertTriangle, Map,
  TrendingDown, Sliders, Globe, Activity, Award, CheckCircle2,
  Trophy, Download, Mic, User, Check, ArrowLeft, Sun, Moon,
  Leaf, LogOut, Info, Sparkles, MessageSquare, ListTodo, Flame, ChevronRight,
  Sparkle, ShieldCheck, Heart, Compass, Menu, X, Settings
} from "lucide-react";
import ThreeGlobe from "@/components/ThreeGlobe";
import {
  CarbonCalculator, AISustainabilityMentor, ProductScanner, WasteSegregationAI,
  FoodImpactAnalyzer, ElectricityBillAnalyzer, ReceiptAnalyzer, ClimateRiskAnalyzer,
  TravelPlanner, CarbonPredictionEngine, WhatIfSimulator, FutureRegretSimulator,
  SustainabilityDigitalTwin, LifeDecisionImpactEngine, EcoDNAProfile, CommunityChallenges,
  Leaderboards, Reports, VoiceAssistant, ProfileSettings
} from "@/components/features/FeatureComponents";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip
} from "recharts";

export default function DashboardPage() {
  const {
    ecoScore,
    dailyCarbon,
    monthlyCarbon,
    annualCarbon,
    highContrast,
    toggleHighContrast
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<string>("home");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const [missions, setMissions] = useState([
    { id: 1, text: "Compost organic waste", done: false },
    { id: 2, text: "Unplug standby electronics", done: false },
  ]);
  const toggleMission = (id: number) => setMissions(p => p.map(m => m.id === id ? { ...m, done: !m.done } : m));

  const sidebarCategories = [
    {
      title: "Core Telemetry",
      items: [
        { id: "home", name: "Dashboard Home", icon: Activity, desc: "System Status & Stats" },
        { id: "twin", name: "Digital Twin", icon: Globe, desc: "Atmospheric Simulation" },
        { id: "mentor", name: "AI Mentor", icon: MessageSquare, desc: "Conversational Advisor" },
        { id: "voice", name: "Voice Assistant", icon: Mic, desc: "Speech Control Node" },
      ]
    },
    {
      title: "Carbon Trackers",
      items: [
        { id: "calculator", name: "Carbon Calculator", icon: Sliders, desc: "Habits Profiler" },
        { id: "food", name: "Food Impact", icon: Utensils, desc: "Diet Emissions LCA" },
        { id: "electricity", name: "Energy Analyzer", icon: Zap, desc: "Electricity grid load" },
        { id: "receipt", name: "Receipt Scanner", icon: FileText, desc: "OCR Invoice Compiler" },
      ]
    },
    {
      title: "AI Analyzers",
      items: [
        { id: "product", name: "Product Scanner", icon: Camera, desc: "LCA Barcode Matcher" },
        { id: "waste", name: "Waste Segregation", icon: Trash2, desc: "Computer Vision Sorter" },
        { id: "dna", name: "Eco DNA", icon: Sparkles, desc: "Ecological Fingerprint" },
      ]
    },
    {
      title: "Predictive Models",
      items: [
        { id: "prediction", name: "Emissions Forecast", icon: TrendingDown, desc: "Regression Predictor" },
        { id: "whatif", name: "What-If Simulator", icon: Sliders, desc: "Variable Modeler" },
        { id: "regret", name: "Future Regret", icon: AlertTriangle, desc: "Temporal Narrative" },
      ]
    },
    {
      title: "Decision Engines",
      items: [
        { id: "decision", name: "Life Decisions", icon: Flame, desc: "Macro Choice Assessor" },
        { id: "travel", name: "Travel Planner", icon: Map, desc: "Transit Route Compare" },
        { id: "climate", name: "Climate Risk", icon: AlertTriangle, desc: "Geospatial Hazard Map" },
      ]
    },
    {
      title: "Community & Logs",
      items: [
        { id: "challenges", name: "Missions & Badges", icon: Trophy, desc: "District Challenges" },
        { id: "leaderboard", name: "Leaderboard", icon: Award, desc: "Global rankings" },
        { id: "reports", name: "Offset Reports", icon: Download, desc: "PDF Emissions Ledger" },
        { id: "profile", name: "System Settings", icon: Settings, desc: "Contrast & Sessions" },
      ]
    }
  ];

  // Flat list of tools for easy searching/rendering
  const allTools = sidebarCategories.flatMap(c => c.items);

  const activeItem = allTools.find(item => item.id === activeTab) || allTools[0];

  const renderToolComponent = (toolId: string) => {
    switch (toolId) {
      case "mentor": return <AISustainabilityMentor />;
      case "calculator": return <CarbonCalculator />;
      case "product": return <ProductScanner />;
      case "waste": return <WasteSegregationAI />;
      case "food": return <FoodImpactAnalyzer />;
      case "electricity": return <ElectricityBillAnalyzer />;
      case "receipt": return <ReceiptAnalyzer />;
      case "climate": return <ClimateRiskAnalyzer />;
      case "travel": return <TravelPlanner />;
      case "prediction": return <CarbonPredictionEngine />;
      case "whatif": return <WhatIfSimulator />;
      case "regret": return <FutureRegretSimulator />;
      case "twin": return <SustainabilityDigitalTwin />;
      case "decision": return <LifeDecisionImpactEngine />;
      case "dna": return <EcoDNAProfile />;
      case "reports": return <Reports />;
      case "challenges": return <CommunityChallenges />;
      case "leaderboard": return <Leaderboards />;
      case "voice": return <VoiceAssistant />;
      case "profile": return <ProfileSettings />;
      default: return null;
    }
  };

  const renderHome = () => {
    const strokeDasharray = 2 * Math.PI * 70;
    const strokeDashoffset = strokeDasharray - (strokeDasharray * ecoScore) / 100;

    const pieData = [
      { name: "Transit", value: parseFloat((dailyCarbon * 0.35).toFixed(1)) },
      { name: "Power", value: parseFloat((dailyCarbon * 0.30).toFixed(1)) },
      { name: "Food", value: parseFloat((dailyCarbon * 0.20).toFixed(1)) },
      { name: "Shopping", value: parseFloat((dailyCarbon * 0.08).toFixed(1)) },
      { name: "Flights", value: parseFloat((dailyCarbon * 0.07).toFixed(1)) }
    ];
    const COLORS = ["#047857", "#10b981", "#34d399", "#6366f1", "#ec4899"];

    const trendData = [
      { name: "Jan", co2: 18.0 },
      { name: "Feb", co2: 16.5 },
      { name: "Mar", co2: 14.8 },
      { name: "Apr", co2: dailyCarbon },
      { name: "May", co2: parseFloat((dailyCarbon * 0.85).toFixed(1)) },
      { name: "Jun", co2: parseFloat((dailyCarbon * 0.72).toFixed(1)) }
    ];

    const badges = [
      { name: "Transit Pioneer", desc: "Use eco-friendly commuting", status: "unlocked", icon: Map, color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" },
      { name: "Vampire Slayer", desc: "Energy usage under 4 hours", status: "unlocked", icon: Zap, color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" },
      { name: "Plant Champion", desc: "Eat vegetarian or vegan meals", status: "locked", icon: Utensils, color: "border-white/5 text-slate-500 bg-white/2" },
      { name: "Mindful Shopper", desc: "Shop monthly or rarely", status: "unlocked", icon: Sparkles, color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" },
      { name: "Fly Light", desc: "Take zero flights per year", status: "locked", icon: Globe, color: "border-white/5 text-slate-500 bg-white/2" },
      { name: "Eco Elite", desc: "Score over 300 Eco Points", status: "locked", icon: Trophy, color: "border-white/5 text-slate-500 bg-white/2" }
    ];

    const recommendations = [
      {
        impact: "Medium Impact",
        priority: "Priority 17",
        title: "Invest in Gold-Standard Certified Carbon Offsets for Flights",
        why: "Since you fly, buying gold-standard carbon offsets helps fund renewable projects that balance out your high-altitude flight emissions.",
        expected: "Finances certified carbon sink or renewable projects globally.",
        difficulty: "Easy (3/5)",
        savings: "Medium (3/5)",
        score: "17"
      },
      {
        impact: "Medium Impact",
        priority: "Priority 15",
        title: "Increase Plant-Based Meals and Choose Local Produce",
        why: "Adding more plant meals and purchasing locally produced ingredients reduces transportation emissions associated with food shipping.",
        expected: "Reduces food miles and supports low-emission farming methods.",
        difficulty: "Easy (3/5)",
        savings: "Medium (3/5)",
        score: "15"
      },
      {
        impact: "Low Impact",
        priority: "Priority 14",
        title: "Participate in Weekly Vegetarian Challenges",
        why: "Joining weekly vegetarian challenges builds habits while saving about 250 kg CO2/year over mixed diets.",
        expected: "Gamifies sustainability to steadily reduce diet footprint.",
        difficulty: "Easy (3/5)",
        savings: "Medium (3/5)",
        score: "14"
      }
    ];

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="glass-hud p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Telemetry Center</span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Good morning, {user?.displayName ? user.displayName.split(" ")[0] : "Eco Citizen"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Your choices today avoid 18% more carbon than last week. Your minor travel modifications and household energy savings keep you on track.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-bold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>4 Days Active Streak</span>
          </div>
        </div>

        {/* Current Standing & Progress Bar */}
        <div className="glass-hud p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Current Standing</span>
                <h3 className="text-lg font-bold text-white tracking-tight">Level 1: Seedling</h3>
                <span className="text-[10px] text-slate-400 font-medium block">Role: Green Starter</span>
              </div>
            </div>
            <div className="w-full md:w-72 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase">
                <span className="text-slate-450">Progress to Next Tier</span>
                <span className="text-emerald-400">40 / 100 pts</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: "40%" }} />
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 uppercase font-semibold">
                <span>Level 1</span>
                <span>Next Milestone: 100 pts</span>
              </div>
            </div>
          </div>

          {/* Badges & Achievements Grid */}
          <div className="border-t border-white/5 pt-6">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-4">Earned Badges & Achievements</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {badges.map((b, idx) => {
                const BadgeIcon = b.icon;
                return (
                  <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center text-center space-y-2.5 transition duration-200 ${b.color}`}>
                    <div className={`p-2 rounded-lg border ${b.status === "unlocked" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/5"}`}>
                      <BadgeIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold block truncate">{b.name}</span>
                      <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{b.desc}</span>
                    </div>
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${b.status === "unlocked" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-slate-500"}`}>
                      {b.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Coach Insight Banner */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start relative overflow-hidden">
          <div className="glow-blob-green absolute -top-12 -left-12 opacity-15 w-24 h-24" />
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Coach Insight</h4>
            <p className="text-[11px] text-emerald-400 font-bold leading-normal">
              Footprint reduced by 49.3% compared to previous assessment!
            </p>
            <p className="text-[11px] text-slate-350 leading-relaxed max-w-4xl mt-1 font-sans">
              <strong className="text-white">POSITIVE TREND DETECTED:</strong> Fantastic progress! Your carbon footprint decreased by 3,700 kg CO₂/year (49% reduction) compared to your previous assessment, driven by optimizations in your lifestyle.
            </p>
          </div>
        </div>

        {/* Speedometer Gauge & KPI Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Speedometer circular gauge */}
          <div className="lg:col-span-5 glass-hud p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Eco Score Speedometer</span>
            
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  className="stroke-slate-900 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">{ecoScore}</span>
                <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold mt-1">Eco Score</span>
                <span className="text-[8px] text-slate-500 mt-0.5 font-bold uppercase">{ecoScore > 80 ? "Excellent" : ecoScore > 65 ? "Optimal" : "Improving"}</span>
              </div>
            </div>
          </div>

          {/* Daily, Monthly, Annual stats */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-hud p-5 flex flex-col justify-between">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">ECO SCORE</span>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight block">{ecoScore} / 100</span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Moderate (Getting Green)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-3 border-t border-white/5 pt-2">
                Target: Level 2 Green Tier
              </p>
            </div>

            <div className="glass-hud p-5 flex flex-col justify-between">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">ANNUAL CARBON</span>
              <div>
                <span className="text-3xl font-extrabold text-white tracking-tight block">3,800 <span className="text-sm font-normal text-slate-450">kg CO₂</span></span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Estimated emissions</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-3 border-t border-white/5 pt-2">
                Target: Under 6,500 kg CO₂
              </p>
            </div>

            <div className="glass-hud p-5 flex flex-col justify-between">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">FORECAST REDUCTION</span>
              <div>
                <span className="text-3xl font-extrabold text-emerald-400 tracking-tight block">-32.9%</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Expected if roadmap followed</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-3 border-t border-white/5 pt-2">
                Target: -25.0% by June
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Carbon breakdown (Pie Chart) */}
          <div className="lg:col-span-5 glass-hud p-6 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-4">Carbon Source Breakdown</span>
            <div className="h-[180px] flex items-center justify-center relative">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      contentStyle={{
                        background: "#0c0e14",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        fontSize: "10px",
                        color: "#fff"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-slate-900 animate-pulse" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] mt-4 border-t border-white/5 pt-3">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-slate-450 uppercase">{item.name} ({item.value} kg)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emissions Forecast & Trends (Area Chart) */}
          <div className="lg:col-span-7 glass-hud p-6 flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-4">6-Month Trend & Forecast</span>
            <div className="h-[200px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={9} />
                    <ChartTooltip
                      contentStyle={{
                        background: "#0c0e14",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        fontSize: "10px",
                        color: "#fff"
                      }}
                    />
                    <Area type="monotone" dataKey="co2" stroke="#10b981" fillOpacity={1} fill="url(#colorCo2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* AI Advisor Preview & Daily Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* AI Mentor Preview */}
          <div className="lg:col-span-7 glass-hud p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                <span className="text-[9px] text-emerald-450 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" /> AI Advisor Insights
                </span>
                <span className="text-[8px] text-slate-500">Telemetry Active</span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed">
                &ldquo;Hello! Switching to commuter rail transit instead of driving today avoids 8.2 kg of CO₂ emissions. This keeps your weekly target stable.&rdquo;
              </p>
            </div>
            <button onClick={() => setActiveTab("mentor")} className="text-[9px] text-emerald-450 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 transition mt-4 cursor-pointer">
              Open Chat Workspace <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Daily Mission checklist */}
          <div className="lg:col-span-5 glass-hud p-5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-sky-400 uppercase tracking-wider font-bold block mb-3">Daily Eco Challenges</span>
              <div className="space-y-2">
                {missions.map(m => (
                  <div key={m.id} className="flex items-start gap-2.5 p-2 bg-white/5 rounded-lg border border-white/5">
                    <button onClick={() => toggleMission(m.id)} className={`w-4 h-4 rounded flex items-center justify-center border transition mt-0.5 ${m.done ? "bg-emerald-500 border-emerald-600 text-black" : "border-slate-700 bg-slate-900"}`}>
                      {m.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className={`text-[10px] leading-tight font-medium ${m.done ? "line-through text-slate-500" : "text-slate-200"}`}>{m.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What Should I Fix First? Recommendations Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">What Should I Fix First?</h3>
            </div>
            <p className="text-xs text-slate-450 mt-1 max-w-3xl">
              Our prioritizer mathematically sorts these recommendations based on high carbon reduction capability, ease of implementation, and overall priority level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((r, idx) => (
              <div key={idx} className="glass-hud p-6 flex flex-col justify-between space-y-4 relative border-t-2 border-t-emerald-500/40">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[8px] font-extrabold uppercase">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{r.impact}</span>
                    <span className="text-slate-450">{r.priority}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug uppercase tracking-tight">{r.title}</h4>
                  <p className="text-[10px] text-slate-450 leading-relaxed font-sans">{r.why}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[9px] space-y-1 mt-auto">
                  <div className="flex justify-between text-slate-500 uppercase font-medium"><span>Why Recommended:</span> <span className="text-slate-350">{r.difficulty}</span></div>
                  <div className="flex justify-between text-slate-500 uppercase font-medium"><span>Expected Impact:</span> <span className="text-emerald-400 font-semibold">{r.expected.slice(0, 30)}...</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation Priority Matrix Table */}
        <div className="glass-hud p-6 space-y-4">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">AI Recommendation Priority Matrix</span>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 uppercase font-semibold">
                  <th className="py-2.5">Action Recommendation</th>
                  <th className="py-2.5">Carbon Impact</th>
                  <th className="py-2.5">Effort / Difficulty</th>
                  <th className="py-2.5 text-emerald-400">Financial Savings</th>
                  <th className="py-2.5 text-right">Priority Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recommendations.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/2 transition">
                    <td className="py-3 font-semibold text-slate-200">{r.title}</td>
                    <td className="py-3"><span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{r.impact}</span></td>
                    <td className="py-3 text-slate-400">{r.difficulty}</td>
                    <td className="py-3 text-emerald-400">{r.savings}</td>
                    <td className="py-3 text-right font-extrabold text-white">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Engine Status & Models List */}
        <div className="glass-hud p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Active Pipeline Status</span>
              <span className="text-xs font-bold text-white tracking-tight block">Hugging Face Inference Node</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { name: "Qwen-2.5-7B", type: "Chat / Reasoning", active: true },
              { name: "Qwen-2-VL", type: "Image VLM OCR", active: true },
              { name: "BLIP-Image", type: "OCR Fallback Classifier", active: true }
            ].map((node, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-200">{node.name}</span>
                <span className="text-slate-500">({node.type})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === "home") {
      return renderHome();
    }
    return (
      <div className="glass-hud p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <span className="text-[9px] text-slate-550 uppercase tracking-wider">Active Workspace Component</span>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight mt-0.5">{activeItem?.name}</h2>
          </div>
          <button onClick={() => setActiveTab("home")} className="text-[10px] text-slate-400 hover:text-white transition uppercase font-bold flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </button>
        </div>
        <div className="pt-2">
          {renderToolComponent(activeTab)}
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-slate-900 border-t-emerald-500 animate-spin" />
          <Leaf className="text-emerald-500 w-5 h-5 absolute animate-pulse" />
        </div>
        <p className="text-slate-450 text-[10px] tracking-wider uppercase animate-pulse">Establishing Session...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07090e] text-[#f3f4f6] flex overflow-x-hidden font-sans">
      {/* Background blobs */}
      <div className="glow-blob-green top-[10%] left-[-200px] opacity-15" />
      <div className="glow-blob-purple bottom-[15%] right-[-200px] opacity-10" />

      {/* Left Navigation Sidebar */}
      <aside className={`w-72 border-r border-white/5 bg-[#0c0e14]/90 backdrop-blur-md flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0 fixed" : "-translate-x-full lg:flex hidden"}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white uppercase">HARI<span className="text-emerald-500">TVA</span></span>
          </Link>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1 lg:hidden text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {sidebarCategories.map(cat => (
            <div key={cat.title} className="space-y-2">
              <span className="text-[9px] text-slate-550 uppercase tracking-widest font-extrabold px-3">{cat.title}</span>
              <nav className="space-y-1">
                {cat.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-start gap-3 cursor-pointer ${isActive ? "bg-white/5 text-emerald-450 border border-white/10" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold block">{item.name}</span>
                        <span className="text-[8px] text-slate-550 block mt-0.5 leading-normal">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer details */}
        <div className="p-4 border-t border-white/5 bg-[#090b0f] flex flex-col gap-2.5">
          {/* User profile dropdown trigger */}
          <div className="flex items-center justify-between relative bg-white/5 border border-white/5 rounded-xl p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-8 h-8 rounded-lg bg-[#064e3b] border border-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold text-xs uppercase shadow-sm">
                {user?.displayName ? user.displayName.substring(0, 2) : "US"}
              </span>
              <div className="overflow-hidden">
                <span className="text-xxs font-bold block text-white truncate">{user?.displayName || "Eco Citizen"}</span>
                <span className="text-[8px] text-slate-550 block truncate">{user?.email || "user@eco.org"}</span>
              </div>
            </div>

            <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="text-slate-400 hover:text-white transition p-1">
              <Settings className="w-3.5 h-3.5" />
            </button>

            {showUserDropdown && (
              <div className="absolute left-2.5 bottom-14 w-[90%] bg-[#0c0e14] border border-white/10 rounded-xl p-2 shadow-xl z-50">
                <button onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/20 transition flex items-center gap-2 cursor-pointer">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#07090e]/85 backdrop-blur-md px-6 py-4 flex justify-between items-center lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="p-1.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white uppercase">HARI<span className="text-emerald-500">TVA</span></span>
            </Link>
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">{activeItem?.name}</span>
        </header>

        {/* Desktop workspace top header info */}
        <div className="hidden lg:flex justify-between items-center px-8 py-4 border-b border-white/5 bg-[#07090e]/50 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Node</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mt-0.5">{activeItem?.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleHighContrast}
              className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition shadow-sm"
              title="Toggle Accessibility">
              {highContrast ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Content scroll window */}
        <main className="flex-1 px-6 py-8 lg:px-10 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
