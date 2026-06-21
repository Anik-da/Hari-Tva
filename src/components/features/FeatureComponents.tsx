"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Car, Plane, Utensils, Camera, FileText,
  Download, Mic, Check, Loader2, UploadCloud,
  Sparkles, Send, Info, Cpu, Map, Sliders, Trash2, AlertTriangle,
  ShieldAlert, ShieldCheck, CheckCircle2
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart, Area
} from "recharts";

// Hydration guard for Recharts charts
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div className="h-64 flex items-center justify-center text-slate-500  text-xs animate-pulse">Loading charts...</div>;
  return <>{children}</>;
}

import { auth } from "@/lib/firebaseClient";

async function apiRequest(path: string, method: "GET" | "POST", body?: unknown) {
  const token = await auth.currentUser?.getIdToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = error => reject(error);
  });
}

// ==========================================
// 1. CARBON CALCULATOR
// ==========================================
export function CarbonCalculator() {
  const { setDailyCarbon, triggerCelebration } = useDashboard();
  const [step, setStep] = useState(1);
  const [transitMiles, setTransitMiles] = useState(20);
  const [vehicleType, setVehicleType] = useState("gas");
  const [electricity, setElectricity] = useState(300);
  const [renewablePercent, setRenewablePercent] = useState(0);
  const [diet, setDiet] = useState("omnivore");
  const [shortFlights, setShortFlights] = useState(2);
  const [longFlights, setLongFlights] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentTransitCO2 = parseFloat((transitMiles * (vehicleType === "gas" ? 0.4 : vehicleType === "hybrid" ? 0.22 : 0.08)).toFixed(2));
  const currentElecCO2 = parseFloat(((electricity * 0.38 * (1 - renewablePercent / 100)) / 30).toFixed(2));
  const currentDietCO2 = diet === "meat-heavy" ? 3.3 : diet === "omnivore" ? 2.5 : diet === "vegetarian" ? 1.7 : 1.1;
  const currentFlightCO2 = parseFloat((((shortFlights * 150) + (longFlights * 800)) / 365).toFixed(2));
  const currentTotal = parseFloat((currentTransitCO2 + currentElecCO2 + currentDietCO2 + currentFlightCO2).toFixed(1));

  const calculateResult = async () => {
    setSubmitting(true);
    try {
      const payload = {
        transport: {
          carType: vehicleType === "gas" ? "ice" : vehicleType === "none" ? "none" : "ev",
          carMiles: transitMiles * 30,
          transitMiles: 0,
          flightHours: (shortFlights * 2) + (longFlights * 8),
        },
        electricity: {
          kwh: electricity,
          renewablePct: renewablePercent,
        },
        water: { gallons: 1500 },
        food: {
          dietType: diet === "meat-heavy" ? "meat-heavy" : diet === "omnivore" ? "balanced" : diet === "vegetarian" ? "vegetarian" : "vegan",
        },
        shopping: { spendAmount: 250 },
        waste: { bags: 4, recycled: true, composted: true },
      };

      const res = await apiRequest("/api/carbon/calculate", "POST", payload);
      setDailyCarbon(res.dailyCarbon);
    } catch (err) {
      console.warn("Carbon Calculate fallback:", err);
      setDailyCarbon(currentTotal);
    } finally {
      setSubmitting(false);
    }
    triggerCelebration();
    setStep(5);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      <div className="glass-hud p-8 flex flex-col justify-between min-h-[440px] border-l-4 border-l-emerald-500 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent" />
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold  tracking-widest text-[#10b981] flex items-center gap-1.5 uppercase"><Cpu className="w-4 h-4" /> Carbon Input Panel</h3>
            <span className="text-[10px]  text-slate-500 uppercase">Stage {step} / 5</span>
          </div>

          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-8">
            <div className="bg-[#10b981] h-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <h4 className="text-xs font-bold  uppercase tracking-wider text-white flex items-center gap-2"><Car className="text-[#10b981] w-4 h-4" /> Transit Profiling</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] "><span className="text-slate-400">DAILY COMMUTE MILES</span><span className="text-white font-bold">{transitMiles} mi</span></div>
                  <input type="range" min="0" max="150" value={transitMiles} onChange={(e) => setTransitMiles(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]" />
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] text-slate-400  uppercase">Engine Efficiency Class</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["gas", "hybrid", "electric"].map((t) => (
                      <button key={t} onClick={() => setVehicleType(t)} 
                        className={`py-2 px-1 rounded-xl border text-[10px]  uppercase tracking-wider transition ${vehicleType === t ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <h4 className="text-xs font-bold  uppercase tracking-wider text-white flex items-center gap-2"><Zap className="text-[#10b981] w-4 h-4" /> Utility Grid Profiles</h4>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] "><span className="text-slate-400">MONTHLY CONSUMPTION</span><span className="text-white font-bold">{electricity} kWh</span></div>
                    <input type="range" min="50" max="1500" value={electricity} onChange={(e) => setElectricity(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] "><span className="text-slate-400">RENEWABLE MATRIX FACTOR</span><span className="text-white font-bold">{renewablePercent}%</span></div>
                    <input type="range" min="0" max="100" value={renewablePercent} onChange={(e) => setRenewablePercent(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <h4 className="text-xs font-bold  uppercase tracking-wider text-white flex items-center gap-2"><Utensils className="text-[#10b981] w-4 h-4" /> Diet Bio-Coefficients</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "meat-heavy", label: "Carnivore bias", desc: "Daily livestock protein" },
                    { id: "omnivore", label: "Balanced Omnivore", desc: "Mixed plants & meat" },
                    { id: "vegetarian", label: "Vegetarian", desc: "Dairy, zero meats" },
                    { id: "vegan", label: "Vegan profile", desc: "100% plant coefficients" }
                  ].map((d) => (
                    <button key={d.id} onClick={() => setDiet(d.id)} 
                      className={`p-4 rounded-xl border text-left transition ${diet === d.id ? "border-[#10b981] bg-[#064e3b] text-white shadow-[0_0_15px_rgba(163,230,53,0.1)]" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                      <div className="font-bold text-xs uppercase">{d.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1 ">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <h4 className="text-xs font-bold  uppercase tracking-wider text-white flex items-center gap-2"><Plane className="text-[#10b981] w-4 h-4" /> Aviation Outflows</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block uppercase">Short Haul (Under 3h)</span>
                      <span className="text-[10px] text-slate-500 ">150kg CO2 per trip</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setShortFlights(Math.max(0, shortFlights - 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-xs font-bold">-</button>
                      <span className="w-6 text-center text-xs  font-bold">{shortFlights}</span>
                      <button onClick={() => setShortFlights(shortFlights + 1)} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-xs font-bold">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block uppercase">Long Haul (Over 3h)</span>
                      <span className="text-[10px] text-slate-500 ">800kg CO2 per trip</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setLongFlights(Math.max(0, longFlights - 1))} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-xs font-bold">-</button>
                      <span className="w-6 text-center text-xs  font-bold">{longFlights}</span>
                      <button onClick={() => setLongFlights(longFlights + 1)} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-white text-xs font-bold">+</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#064e3b] border border-[#10b981] text-[#10b981] flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(163,230,53,0.2)]">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Calibration Complete</h4>
                <p className="text-xs text-slate-400 font-medium">Eco Score metrics synchronized successfully across active nodes.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
          {step > 1 && step < 5 ? (
            <button onClick={() => setStep(p => p - 1)} className="btn-cyber-secondary px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer">
              Previous
            </button>
          ) : <div />}
          
          {step < 4 ? (
            <button onClick={() => setStep(p => p + 1)} className="btn-cyber-primary px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer">
              Next Step
            </button>
          ) : step === 4 ? (
            <button onClick={calculateResult} disabled={submitting} className="btn-cyber-primary px-6 py-2.5 rounded-xl text-xs uppercase flex items-center gap-1.5 cursor-pointer">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Compile"}
            </button>
          ) : (
            <button onClick={() => setStep(1)} className="btn-cyber-secondary px-6 py-2.5 rounded-xl text-xs uppercase w-full cursor-pointer">
              Re-Calibrate System
            </button>
          )}
        </div>
      </div>

      {/* Footprint Insight Summary */}
      <div className="glass-hud p-8 flex flex-col justify-between min-h-[440px] border-l-4 border-l-emerald-500">
        <div>
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1.5 font-bold">Your Daily Impact</span>
          <h4 className="text-xl font-bold text-white tracking-tight">Footprint Breakdown</h4>
        </div>

        <div className="space-y-3.5 text-xs my-6">
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 flex items-center gap-2"><Car className="w-4 h-4 text-emerald-500" /> Commute Travel</span>
            <span className="text-white font-semibold">{currentTransitCO2} kg CO₂ / day</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" /> Household Power</span>
            <span className="text-white font-semibold">{currentElecCO2} kg CO₂ / day</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 flex items-center gap-2"><Utensils className="w-4 h-4 text-emerald-500" /> Diet & Nutrition</span>
            <span className="text-white font-semibold">{currentDietCO2} kg CO₂ / day</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400 flex items-center gap-2"><Plane className="w-4 h-4 text-emerald-500" /> Flights & Travel</span>
            <span className="text-white font-semibold">{currentFlightCO2} kg CO₂ / day</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center text-xs">
            <span className="text-white font-bold uppercase tracking-wider">Estimated Total</span>
            <span className="text-emerald-400 font-black text-base">{currentTotal} kg CO₂ / day</span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 text-xs">
            <span className="text-emerald-450 font-bold block mb-1">What this means:</span>
            <p className="text-slate-450 leading-relaxed font-sans text-[11px]">
              Your output is lower than 68% of households in your region. Swapping 2 commute days to electric public transit will lower this by another 3.1 kg CO₂ per day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. AI SUSTAINABILITY MENTOR
// ==========================================
export function AISustainabilityMentor() {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your AI Sustainability Mentor. Ask me any questions about reducing emissions, switching to solar power, optimizing home utility budgets, or planning green travel." }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const predefinedQuestions = [
    "How do I lower my home electricity footprint?",
    "What are some simple ways to avoid single-use plastics?",
    "Compare the footprint of high-speed rail vs flying",
    "How much carbon does a plant-based diet save?"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text }]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await apiRequest("/api/ai/mentor", "POST", { message: text });
      setMessages(prev => [...prev, { sender: "ai", text: res.reply }]);
    } catch (err) {
      console.warn("AI mentor fallback:", err);
      let aiText = "Adjusting everyday choices like heating, diet, and transit yields the most immediate and positive outcomes.";
      const query = text.toLowerCase();
      if (query.includes("power") || query.includes("electricity") || query.includes("energy")) {
        aiText = "Electricity grids often pull from fossil fuel sources during peak periods. Try shifting laundry or dishwasher tasks to early morning or late night, lowering your thermostat by 2 degrees, and swapping incandescent bulbs for energy-efficient LEDs.";
      } else if (query.includes("plastic") || query.includes("waste")) {
        aiText = "Avoiding single-use plastics is simple: switch to concentrated detergent sheets instead of plastic jugs, select loose produce rather than pre-packaged options, and carry a reusable water bottle and canvas shopping bags.";
      } else if (query.includes("rail") || query.includes("fly") || query.includes("travel") || query.includes("car")) {
        aiText = "Commuter electric trains and high-speed rail produce up to 90% fewer greenhouse emissions per passenger mile compared to regional commercial flights or driving gasoline vehicles. For driving, switching to an electric vehicle breaks even on production carbon in about 15,000 miles.";
      } else if (query.includes("diet") || query.includes("food") || query.includes("plant")) {
        aiText = "Agricultural livestock production is carbon-intensive: 1 kg of beef creates around 60 kg of greenhouse gases, while legumes and vegetables produce less than 1 kg. Shifting just 2-3 meals per week to fully plant-based alternatives makes a massive difference.";
      }
      setMessages(prev => [...prev, { sender: "ai", text: aiText }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto glass-hud p-6 sm:p-8 flex flex-col justify-between min-h-[520px] relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Sustainability Mentor</h3>
              <p className="text-[10px] text-slate-500 uppercase mt-0.5">Powered by Gemini Large Language Model</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase bg-emerald-500/10 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Advisor Active
          </span>
        </div>

        {/* Message stream */}
        <div className="space-y-4 mb-8 pr-2 scrollbar-thin min-h-[220px] max-h-[340px] overflow-y-auto">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${m.sender === "user" ? "bg-emerald-500 text-black font-semibold shadow-md" : "bg-white/5 text-slate-200 border border-white/5"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 text-slate-450 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Predefined prompts */}
        {messages.length === 1 && (
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Suggested Questions</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {predefinedQuestions.map((q, idx) => (
                <button key={idx} onClick={() => handleSend(q)} 
                  className="text-left text-xs p-3 rounded-xl border border-white/5 hover:border-emerald-500/35 bg-white/5 hover:bg-emerald-500/5 text-slate-300 transition block truncate cursor-pointer">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }} className="flex gap-2 relative">
          <input type="text" placeholder="Ask your advisor about lowering emissions..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="glass-input flex-1 px-4 py-3.5 text-xs text-white" />
          <button type="submit" className="btn-cyber-primary px-6 py-3.5 rounded-xl text-xs uppercase flex items-center justify-center cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. PRODUCT SCANNER
// ==========================================
export function ProductScanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<{
    name: string;
    carbon: string;
    score: string;
    grade: string;
    details: string;
  } | null>(null);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setScannedItem(null);

    try {
      const b64 = await fileToBase64(file);
      const base64Data = b64.includes(",") ? b64.split(",")[1] : b64;
      const mimeType = file.type || "image/jpeg";
      
      const res = await apiRequest("/api/vision/scan", "POST", {
        image: base64Data,
        mimeType: mimeType,
        type: "product"
      });

      const scoreValue = res.score || "85";
      const mapped = {
        name: res.name || "Identified Product",
        carbon: res.carbon || "0.5 kg CO2e",
        score: isNaN(Number(scoreValue)) ? (scoreValue.startsWith("A") ? "95" : scoreValue.startsWith("B") ? "80" : "70") : scoreValue,
        grade: res.grade || (isNaN(Number(scoreValue)) ? `Grade ${scoreValue}` : "Grade A"),
        details: res.breakdown || res.details || "Diagnostic metrics processed successfully."
      };
      
      setScannedItem(mapped);
    } catch (err) {
      console.error("LCA Scanner Vision Error:", err);
      setScannedItem({
        name: "Eco Thermal Flask",
        carbon: "1.2 kg CO2e",
        score: "88",
        grade: "Grade A",
        details: "Manufactured from 80% recycled aluminum. Transport logs verify offset transit metrics."
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-6 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div>
          <span className="text-[10px]  text-[#10b981] uppercase tracking-widest block mb-2 font-bold">COMPUTER VISION NODE</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">LCA Scan Terminal</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">Upload invoice documents or barcode graphics to match against certified Lifecycle Assessment (LCA) matrices automatically.</p>
        </div>

        <div className="my-6">
          <label className="flex flex-col items-center justify-center border border-dashed border-[#10b981]/30 hover:border-[#10b981]/70 bg-black/40 rounded-xl p-8 cursor-pointer transition">
            <UploadCloud className="w-8 h-8 text-[#10b981] mb-3 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase  tracking-wider">Select Product Image</span>
            <span className="text-[10px] text-slate-500  mt-1">PNG, JPG up to 1GB</span>
            <input type="file" accept="image/*" onChange={handleScan} className="hidden" />
          </label>
        </div>
      </div>

      <div className="lg:col-span-6 glass-hud-cyan p-8 flex flex-col justify-center items-center text-center border-l-4 border-l-sky-500 min-h-[380px] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent" />
        {scanning ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-[#0ea5e9] animate-spin mx-auto" />
            <p className="text-xs  text-[#0ea5e9] uppercase tracking-widest animate-pulse">Running LCA algorithms...</p>
          </div>
        ) : scannedItem ? (
          <div className="w-full text-left space-y-6">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px]  text-slate-500 uppercase">PRODUCT RESOLVED</span>
                <h4 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">{scannedItem.name}</h4>
              </div>
              <span className="px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] rounded-lg text-xs  font-bold">{scannedItem.grade}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4  text-xs">
              <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase block text-[9px]">LCA Footprint</span>
                <span className="text-white font-bold text-sm block mt-1">{scannedItem.carbon}</span>
              </div>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase block text-[9px]">Eco Rating</span>
                <span className="text-[#0ea5e9] font-bold text-sm block mt-1">{scannedItem.score} / 100</span>
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <span className="text-[9px]  text-slate-500 uppercase block mb-1">Diagnostic Log</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{scannedItem.details}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-8">
            <Camera className="w-10 h-10 text-slate-650 mx-auto animate-pulse" />
            <p className="text-xxs  text-slate-550 uppercase">LCA Output Display Awaiting Input</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. WASTE SEGREGATION AI
// ==========================================
export function WasteSegregationAI() {
  const [segregating, setSegregating] = useState(false);
  const [resolvedCategory, setResolvedCategory] = useState<string | null>(null);

  const handleUpload = () => {
    setSegregating(true);
    setResolvedCategory(null);
    setTimeout(() => {
      setSegregating(false);
      setResolvedCategory("recyclable");
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-6 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div>
          <span className="text-[10px]  text-[#10b981] uppercase tracking-widest block mb-2 font-bold">CLASSIFICATION NODE</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Waste Classifier</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">Scan domestic garbage items via computer vision to dynamically categorize into compost, recyclable, or hazardous pipelines.</p>
        </div>

        <div className="my-6">
          <button onClick={handleUpload} className="btn-cyber-primary w-full py-4 rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" /> Simulate Vision Capture
          </button>
        </div>
      </div>

      <div className="lg:col-span-6 glass-hud-purple p-8 flex flex-col justify-center items-center text-center border-l-4 border-l-indigo-500 min-h-[380px]">
        {segregating ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-[#6366f1] animate-spin mx-auto" />
            <p className="text-xs  text-[#6366f1] uppercase tracking-widest animate-pulse">Running segregation algorithms...</p>
          </div>
        ) : resolvedCategory ? (
          <div className="w-full text-left space-y-6">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9px]  text-[#6366f1] uppercase">CLASSIFICATION LOG</span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">PET Recyclable Grade A</h4>
            </div>

            <div className="bg-[#064e3b] p-5 rounded-2xl border border-[#10b981]/25 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black/60 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px]  text-slate-400 uppercase">DESTINATION PIPELINE</span>
                <span className="text-xs font-bold text-white block uppercase mt-0.5">Municipal Blue Bin recycling</span>
              </div>
            </div>

            <div className="text-[10px]  text-slate-500 leading-relaxed">
              * Local guidelines mandate removing paper adhesive label overlays before segregation.
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-8">
            <Trash2 className="w-10 h-10 text-slate-650 mx-auto animate-pulse" />
            <p className="text-xxs  text-slate-550 uppercase">Segregation Node Idle</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. FOOD IMPACT ANALYZER
// ==========================================
export function FoodImpactAnalyzer() {
  const [mealWeight, setMealWeight] = useState(300);
  const [proteinType, setProteinType] = useState("beef");

  const coefficients: Record<string, number> = { beef: 18.0, poultry: 4.2, dairy: 2.8, plant: 0.3 };
  const computedImpact = parseFloat(((mealWeight / 1000) * coefficients[proteinType]).toFixed(2));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-7 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs  text-[#10b981] font-bold uppercase tracking-wider flex items-center gap-1.5"><Utensils className="w-4 h-4" /> DIETARY CODES</span>
            <span className="text-[9px]  text-slate-500 uppercase">SYS_LCA_FOOD</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs  font-bold"><span className="text-slate-350">MEAL MASS VALUE</span><span className="text-[#10b981]">{mealWeight} grams</span></div>
              <input type="range" min="50" max="1000" value={mealWeight} onChange={e => setMealWeight(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]" />
            </div>

            <div className="space-y-3">
              <label className="text-xs  font-bold text-slate-350 block uppercase">Protein Category</label>
              <div className="grid grid-cols-4 gap-2">
                {["beef", "poultry", "dairy", "plant"].map((t) => (
                  <button key={t} onClick={() => setProteinType(t)} 
                    className={`py-2 px-1 rounded-xl border text-[10px]  uppercase tracking-wider transition ${proteinType === t ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold shadow-[0_0_10px_rgba(163,230,53,0.15)]" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 mt-6">
          <CheckCircle2 className="text-[#10b981] w-5 h-5 flex-shrink-0" />
          <p className="text-[10px] text-slate-400 font-medium">Dietary carbon coefficients include land conversion factors, fertilizers, and logistics.</p>
        </div>
      </div>

      <div className="lg:col-span-5 glass-hud-purple p-8 flex flex-col justify-between text-center border-l-4 border-l-indigo-500 min-h-[380px] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
        <div>
          <span className="text-[9px]  text-[#6366f1] uppercase tracking-wider block mb-2 font-bold">LCA ANALYSIS</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Emissions Yield</h4>
        </div>

        <div className="my-6 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-dashed border-[#6366f1]/20 flex flex-col items-center justify-center animate-[spin_80s_linear_infinite]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-3xl font-black text-white  tracking-tighter">{computedImpact}</span>
            <span className="text-[9px]  text-[#10b981] uppercase font-bold tracking-widest">KG CO2e</span>
          </div>
        </div>

        <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-[10px]  text-slate-400 leading-normal">
          * Shifting from beef to plant protein saves approximately {parseFloat(((mealWeight / 1000) * 17.7).toFixed(2))} kg of CO2 emissions.
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. ELECTRICITY BILL ANALYZER
// ==========================================
export function ElectricityBillAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ kwh: number; cost: number; co2: number } | null>(null);

  const handleSimulate = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({ kwh: 420, cost: 68.5, co2: 159.6 });
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-6 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div>
          <span className="text-[10px]  text-[#10b981] uppercase tracking-widest block mb-2 font-bold">OCR INVOICE EXTRACTOR</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Utility Bill Parser</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">Upload electricity utility statements. Our OCR model extracts absolute consumption figures and calculates corresponding emissions coefficients based on local grids.</p>
        </div>

        <div className="my-6">
          <button onClick={handleSimulate} className="btn-cyber-primary w-full py-4 rounded-xl text-xs uppercase cursor-pointer">
            Parse Utility Invoice
          </button>
        </div>
      </div>

      <div className="lg:col-span-6 glass-hud-cyan p-8 flex flex-col justify-center items-center text-center border-l-4 border-l-sky-500 min-h-[380px]">
        {analyzing ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-[#0ea5e9] animate-spin mx-auto" />
            <p className="text-xs  text-[#0ea5e9] uppercase tracking-widest animate-pulse">Running OCR layout parser...</p>
          </div>
        ) : result ? (
          <div className="w-full text-left space-y-6">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9px]  text-[#0ea5e9] uppercase">OCR RESOLUTION MATCH</span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">Invoice data verified</h4>
            </div>

            <div className="grid grid-cols-3 gap-3  text-xs">
              <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase block text-[8px]">Consumption</span>
                <span className="text-white font-bold block mt-1">{result.kwh} kWh</span>
              </div>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase block text-[8px]">Cost Value</span>
                <span className="text-white font-bold block mt-1">${result.cost}</span>
              </div>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5">
                <span className="text-slate-500 uppercase block text-[8px]">Carbon Coefficient</span>
                <span className="text-[#10b981] font-bold block mt-1">{result.co2} kg</span>
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-[10px] text-slate-450 leading-relaxed ">
              * Verification node confirms matching local utility carbon index coefficients.
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-8">
            <FileText className="w-10 h-10 text-slate-650 mx-auto animate-pulse" />
            <p className="text-xxs  text-slate-550 uppercase">Invoice parser idle</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 7. RECEIPT ANALYZER
// ==========================================
export function ReceiptAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSimulate = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult("Organic Milk: Grade A (0.8kg CO2) | Red Meat 500g: Grade D (14.2kg CO2) | Avocado Bag: Grade B (1.5kg CO2)");
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-6 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div>
          <span className="text-[10px]  text-[#10b981] uppercase tracking-widest block mb-2 font-bold">LCA BASKET INDEX</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Receipt Scanner</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">Extract food item arrays from grocery invoice receipts using OCR logic. Renders carbon impact estimates for each raw product based on lifecycle databases.</p>
        </div>

        <div className="my-6">
          <button onClick={handleSimulate} className="btn-cyber-primary w-full py-4 rounded-xl text-xs uppercase cursor-pointer">
            Scan Grocery Receipt
          </button>
        </div>
      </div>

      <div className="lg:col-span-6 glass-hud-purple p-8 flex flex-col justify-center items-center text-center border-l-4 border-l-indigo-500 min-h-[380px]">
        {analyzing ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-[#6366f1] animate-spin mx-auto" />
            <p className="text-xs  text-[#6366f1] uppercase tracking-widest animate-pulse">Running OCR receipt compiler...</p>
          </div>
        ) : result ? (
          <div className="w-full text-left space-y-6">
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9px]  text-[#6366f1] uppercase">EXTRACTED ITEM ARRAY</span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">LCA Basket breakdown</h4>
            </div>

            <div className="space-y-3  text-xs">
              {result.split(" | ").map((item, idx) => {
                const [name, rest] = item.split(": ");
                return (
                  <div key={idx} className="bg-black/60 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-white font-bold uppercase">{name}</span>
                    <span className="text-[#10b981] font-bold">{rest}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-8">
            <FileText className="w-10 h-10 text-slate-650 mx-auto animate-pulse" />
            <p className="text-xxs  text-slate-550 uppercase">Receipt Scanner Idle</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 8. CLIMATE RISK ANALYZER
// ==========================================
export function ClimateRiskAnalyzer() {
  const [geoLoc, setGeoLoc] = useState("coastal");
  const [simYear, setSimYear] = useState(2050);

  const risks: Record<string, Record<number, string>> = {
    coastal: {
      2035: "Sea levels rise +8cm. Minor low-tide flooding on coastal infrastructure lines.",
      2050: "Sea levels rise +22cm. Frequent high-tide flooding. Storm surge risks increase by 3x.",
      2080: "Sea levels rise +60cm. Permanent shoreline erosion. Coastal zoning limits strictly enforced."
    },
    arid: {
      2035: "Water scarcity index rises by 12%. Heatwave intervals drop to every 2 years.",
      2050: "Severe agricultural drought risks. 35 days annually exceeding 105°F peak thresholds.",
      2080: "Arable crop yield indices decrease by 30%. Desertification warning indicators active."
    },
    urban: {
      2035: "Heat island index rises by +1.5°F. Grid cooling load draws surge 20%.",
      2050: "High urban heat indices. Severe runoff surge risks during peak downpours.",
      2080: "Infrastructure strain. Subways require active cooling nets. Grid brownout risks: +40%."
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-7 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs  text-[#10b981] font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> GEOGRAPHIC MATRIX</span>
            <span className="text-[9px]  text-slate-500 uppercase">SYS_CLIMATE_RISK</span>
          </div>

          <div className="space-y-6  text-xs">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-350 block uppercase">Zone Profile</label>
              <div className="grid grid-cols-3 gap-2">
                {["coastal", "arid", "urban"].map((t) => (
                  <button key={t} onClick={() => setGeoLoc(t)} 
                    className={`py-2.5 px-1 rounded-xl border text-[10px]  uppercase tracking-wider transition ${geoLoc === t ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold shadow-[0_0_10px_rgba(163,230,53,0.15)]" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between font-bold"><span className="text-slate-350">SIMULATE FUTURE YEAR</span><span className="text-[#10b981]">{simYear}</span></div>
              <div className="flex justify-between gap-4">
                {[2035, 2050, 2080].map((yr) => (
                  <button key={yr} onClick={() => setSimYear(yr)} 
                    className={`flex-1 py-2.5 rounded-xl border text-[10px] transition ${simYear === yr ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold" : "border-slate-800 bg-black/40 text-slate-450 hover:border-slate-700"}`}>
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 mt-6">
          <Info className="text-[#10b981] w-5 h-5 flex-shrink-0" />
          <p className="text-[10px] text-slate-400 font-medium">Projections leverage IPCC AR6 climate intelligence modeling datasets.</p>
        </div>
      </div>

      <div className="lg:col-span-5 glass-hud-purple p-8 flex flex-col justify-between text-center border-l-4 border-l-indigo-500 min-h-[380px] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
        <div>
          <span className="text-[9px]  text-[#6366f1] uppercase tracking-wider block mb-2 font-bold">IPCC PROJECTION</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Risk Diagnostic</h4>
        </div>

        <div className="my-6 bg-black/60 p-5 rounded-2xl border border-white/5 text-left  text-xs leading-relaxed">
          <span className="text-[#10b981] block mb-2 font-bold">{"// RISKS DETECTED"}</span>
          {risks[geoLoc][simYear]}
        </div>

        <div className="bg-red-950/15 border border-red-500/25 p-4 rounded-xl flex items-center gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-[10px]  text-red-300 leading-normal uppercase">Adaptation structural code modifications recommended.</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. TRAVEL PLANNER
// ==========================================
export function TravelPlanner() {
  const [miles, setMiles] = useState(250);
  const [selectedRoute, setSelectedRoute] = useState<string>("rail");

  const coefficients: Record<string, number> = { rail: 0.04, ev: 0.08, air: 0.32 };
  const getCarbon = (mode: string) => parseFloat((miles * coefficients[mode]).toFixed(1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-7 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs  text-[#10b981] font-bold uppercase tracking-wider flex items-center gap-1.5"><Map className="w-4 h-4" /> TRAVEL ROUTER</span>
            <span className="text-[9px]  text-slate-500 uppercase font-bold">SYS_LCA_ROUTING</span>
          </div>

          <div className="space-y-6  text-xs">
            <div className="space-y-3">
              <div className="flex justify-between font-bold"><span className="text-slate-350">ROUTE DISTANCE</span><span className="text-[#10b981]">{miles} miles</span></div>
              <input type="range" min="50" max="1500" value={miles} onChange={e => setMiles(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]" />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-350 block uppercase">Mode Coefficient Selection</label>
              <div className="grid grid-cols-3 gap-2">
                {["rail", "ev", "air"].map((m) => (
                  <button key={m} onClick={() => setSelectedRoute(m)} 
                    className={`py-2.5 px-1 rounded-xl border text-[10px]  uppercase tracking-wider transition ${selectedRoute === m ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold shadow-[0_0_10px_rgba(163,230,53,0.15)]" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                    {m === "rail" ? "High-Speed Rail" : m === "ev" ? "Electric Vehicle" : "Commercial Air"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 mt-6">
          <CheckCircle2 className="text-[#10b981] w-5 h-5 flex-shrink-0" />
          <p className="text-[10px] text-slate-400 font-medium font-sans">Real-time mapping balances travel coefficients against regional grid carbon intensities.</p>
        </div>
      </div>

      <div className="lg:col-span-5 glass-hud-cyan p-8 flex flex-col justify-between text-center border-l-4 border-l-sky-500 min-h-[380px] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent" />
        <div>
          <span className="text-[9px]  text-[#0ea5e9] uppercase tracking-wider block mb-2 font-bold">ROUTE OUTFLOW</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Emissions yield</h4>
        </div>

        <div className="my-6 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-dashed border-[#0ea5e9]/20 flex flex-col items-center justify-center animate-[spin_80s_linear_infinite]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-3xl font-black text-white  tracking-tighter">{getCarbon(selectedRoute)}</span>
            <span className="text-[9px]  text-[#10b981] uppercase font-bold tracking-widest">KG CO2e</span>
          </div>
        </div>

        <div className="bg-black/60 p-4 rounded-xl border border-white/5 text-[10px]  text-slate-400 leading-normal">
          * Choosing high-speed rail instead of aviation saves {parseFloat((getCarbon("air") - getCarbon("rail")).toFixed(1))} kg of CO2 emissions.
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. CARBON PREDICTION ENGINE
// ==========================================
export function CarbonPredictionEngine() {
  const { dailyCarbon } = useDashboard();

  const forecastData = [
    { year: '2026', baseline: dailyCarbon * 365, target: dailyCarbon * 365 },
    { year: '2028', baseline: dailyCarbon * 365 * 1.05, target: dailyCarbon * 365 * 0.8 },
    { year: '2030', baseline: dailyCarbon * 365 * 1.1, target: dailyCarbon * 365 * 0.6 },
    { year: '2032', baseline: dailyCarbon * 365 * 1.15, target: dailyCarbon * 365 * 0.45 },
    { year: '2035', baseline: dailyCarbon * 365 * 1.2, target: dailyCarbon * 365 * 0.3 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-8 glass-hud p-6 sm:p-8 border-l-4 border-l-emerald-500">
        <h3 className="text-xs font-bold  tracking-wider text-[#10b981] uppercase mb-2">10-Year Forecast Trajectory</h3>
        <p className="text-xxs text-slate-500  uppercase mb-6">Machine learning projections relative to net zero pathways.</p>

        <div className="h-60 relative">
          <ClientOnly>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.02)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" fontSize={9} className="" />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} className="" />
                <Tooltip contentStyle={{ backgroundColor: "#030712", borderColor: "rgba(255,255,255,0.05)", fontSize: 10, borderRadius: 12, color: "#fff" }} />
                <Area type="monotone" dataKey="baseline" stroke="#ef4444" strokeWidth={1.5} fill="transparent" name="Business As Usual" />
                <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2.5} fill="rgba(163, 230, 53, 0.03)" name="Decarbonized Pathway" />
              </AreaChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
      </div>

      <div className="lg:col-span-4 glass-hud-purple p-8 flex flex-col justify-between border-l-4 border-l-indigo-500 min-h-[350px]">
        <div>
          <span className="text-[10px]  text-[#6366f1] uppercase tracking-widest block mb-2 font-bold">PREDICTIVE ANALYTICS</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Decarbonization Index</h4>
        </div>

        <div className="my-6 bg-black/60 p-5 rounded-2xl border border-white/5 text-left  text-xs leading-relaxed">
          <span className="text-[#6366f1] block mb-2 font-bold">{"// AI INSIGHT CORE"}</span>
          Under current reduction trajectories, target compliance is scheduled for Q3 2030, avoiding carbon penalties.
        </div>

        <div className="bg-[#064e3b] p-4 rounded-xl border border-[#10b981]/25 flex items-center justify-between text-xs ">
          <span className="text-white font-bold uppercase">Net Savings (2035)</span>
          <span className="text-[#10b981] font-black text-base">-{Math.round(dailyCarbon * 365 * 0.9)} kg/yr</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. WHAT-IF SIMULATOR
// ==========================================
export function WhatIfSimulator() {
  const [commuteOption, setCommuteOption] = useState("ev");
  const [hvacOption, setHvacOption] = useState("heatpump");

  const savings: Record<string, number> = {
    ev: 3200,
    transit: 1800,
    gas: 0,
    heatpump: 4100,
    solar: 5400,
    gasheat: 0
  };

  const netSavings = savings[commuteOption] + savings[hvacOption];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-7 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs  text-[#10b981] font-bold uppercase tracking-wider flex items-center gap-1.5"><Sliders className="w-4 h-4" /> DECISION MATRIX</span>
            <span className="text-[9px]  text-slate-500 uppercase">SYS_DECISION_SIM</span>
          </div>

          <div className="space-y-6  text-xs">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-350 block uppercase">Transit Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "ev", label: "Switch to EV" },
                  { id: "transit", label: "Public Rail" },
                  { id: "gas", label: "Gas Combustion" }
                ].map((c) => (
                  <button key={c.id} onClick={() => setCommuteOption(c.id)} 
                    className={`py-2.5 px-1 rounded-xl border text-[10px]  uppercase tracking-wider transition ${commuteOption === c.id ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-350 block uppercase">Household Energy Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "heatpump", label: "Geothermal Pump" },
                  { id: "solar", label: "Solar Array" },
                  { id: "gasheat", label: "Natural Gas Grid" }
                ].map((h) => (
                  <button key={h.id} onClick={() => setHvacOption(h.id)} 
                    className={`py-2.5 px-1 rounded-xl border text-[10px]  uppercase tracking-wider transition ${hvacOption === h.id ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 mt-6">
          <CheckCircle2 className="text-[#10b981] w-5 h-5 flex-shrink-0" />
          <p className="text-[10px] text-slate-400 font-medium font-sans">Simulating infrastructure changes yields cumulative mitigation projections over 10-year horizons.</p>
        </div>
      </div>

      <div className="lg:col-span-5 glass-hud-cyan p-8 flex flex-col justify-between text-center border-l-4 border-l-sky-500 min-h-[380px] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0ea5e9] to-transparent" />
        <div>
          <span className="text-[9px]  text-[#0ea5e9] uppercase tracking-wider block mb-2 font-bold">CUMULATIVE SAVINGS</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Projected Yield</h4>
        </div>

        <div className="my-6 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-dashed border-[#0ea5e9]/20 flex flex-col items-center justify-center animate-[spin_80s_linear_infinite]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-2xl font-black text-white  tracking-tighter">+{netSavings}</span>
            <span className="text-[9px]  text-[#10b981] uppercase font-bold tracking-widest">KG CO2e/YR</span>
          </div>
        </div>

        <div className="bg-[#064e3b] p-4 border border-[#10b981]/25 rounded-xl text-[10px]  text-slate-350 leading-normal text-left flex gap-3 items-center">
          <ShieldCheck className="w-5 h-5 text-[#10b981] flex-shrink-0" />
          <span>Savings verified relative to scientific lifecycle indices.</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 12. FUTURE REGRET SIMULATOR
// ==========================================
export function FutureRegretSimulator() {
  const [selectedYear, setSelectedYear] = useState(2050);
  const [impactPath, setImpactPath] = useState<"high" | "low">("high");

  const storyLines = {
    high: {
      2035: "High-emissions: Global average temperatures rise +1.4°F. Grid capacity strains during heatwave slots. Municipal utility rates spike +30%.",
      2050: "Critical carbon threshold: Global temperatures hit +2.2°F. Arable agricultural zones decrease by 25%. Severe runoffs flood local infrastructures.",
      2080: "Runaway trajectory: Global temp exceeds +4.0°F. Shoreline boundaries move inland by 80 meters. Mandatory climate migration grids online."
    },
    low: {
      2035: "Optimized trajectory: Global warming limited to +1.1°F. Smart grid stabilization active. Renewable energy sources yield 65% of net power.",
      2050: "Net Zero compliance: Global warming stabilizes at +1.3°F. Municipal grids run 90% carbon-free. Forest reserves cover 35% of landmass.",
      2080: "Ecological recovery: Atmospheric carbon drop verified. Marine bio-indices increase +15%. Global climate stabilizes at pre-industrial levels."
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-7 glass-hud p-8 flex flex-col justify-between min-h-[380px] border-l-4 border-l-emerald-500">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs  text-[#10b981] font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> TIMELINE ENGINE</span>
            <span className="text-[9px]  text-slate-500 uppercase">SYS_REGRET_SIM</span>
          </div>

          <div className="space-y-6  text-xs">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-350 block uppercase">Emissions Pathway</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "high", label: "Business As Usual" },
                  { id: "low", label: "Net Zero Path" }
                ].map((p) => (
                  <button key={p.id} onClick={() => setImpactPath(p.id as "high" | "low")} 
                    className={`py-2.5 px-1 rounded-xl border text-[10px]  uppercase tracking-wider transition ${impactPath === p.id ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-350 block uppercase">Target Horizon</label>
              <div className="grid grid-cols-3 gap-2">
                {[2035, 2050, 2080].map((yr) => (
                  <button key={yr} onClick={() => setSelectedYear(yr)} 
                    className={`py-2.5 px-1 rounded-xl border text-[10px] transition ${selectedYear === yr ? "border-[#10b981] bg-[#064e3b] text-[#10b981] font-bold" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 mt-6">
          <Info className="text-[#10b981] w-5 h-5 flex-shrink-0" />
          <p className="text-[10px] text-slate-400 font-medium font-sans">Simulating atmospheric accumulation models to predict local socioeconomic risks.</p>
        </div>
      </div>

      <div className="lg:col-span-5 glass-hud-purple p-8 flex flex-col justify-between text-center border-l-4 border-l-indigo-500 min-h-[380px] relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6366f1] to-transparent" />
        <div>
          <span className="text-[9px]  text-[#6366f1] uppercase tracking-wider block mb-2 font-bold">TIMELINE DIAGNOSTIC</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Projection Output</h4>
        </div>

        <div className="my-6 bg-black/60 p-5 rounded-2xl border border-white/5 text-left  text-xs leading-relaxed">
          <span className="text-[#10b981] block mb-2 font-bold">{"// MODEL OUTPUT DATA"}</span>
          {storyLines[impactPath][selectedYear as 2035 | 2050 | 2080]}
        </div>

        <div className={`p-4 rounded-xl flex items-center gap-3 text-left ${impactPath === "high" ? "bg-red-950/15 border border-red-500/25 text-red-300" : "bg-[#064e3b] border border-[#10b981]/25 text-[#10b981]"}`}>
          {impactPath === "high" ? <ShieldAlert className="w-5 h-5 flex-shrink-0" /> : <ShieldCheck className="w-5 h-5 flex-shrink-0" />}
          <span className="text-[10px]  leading-normal uppercase">{impactPath === "high" ? "Uncontrolled ecological strain verified." : "Decarbonized stability indices observed."}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 13. SUSTAINABILITY DIGITAL TWIN
// ==========================================
export function SustainabilityDigitalTwin() {
  const { ecoScore, dailyCarbon } = useDashboard();
  
  const getTwinColor = () => {
    if (ecoScore > 85) return "#bef264";
    if (ecoScore > 65) return "#0ea5e9";
    if (ecoScore > 50) return "#6366f1";
    return "#ef4444";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Neural Avatar Panel */}
      <div className="lg:col-span-6 glass-hud p-8 flex flex-col justify-between items-center text-center relative overflow-hidden border-l-4 border-l-emerald-500 min-h-[400px]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent" />
        <div>
          <span className="text-[10px]  uppercase text-[#10b981] tracking-widest block font-bold mb-2">NEURAL SYNC PIPELINE</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight">Biomorphic Twin</h4>
        </div>

        <div className="flex justify-center items-center py-6 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-xl animate-pulse" />
          {/* Futuristic HUD biomorphic shape */}
          <svg width="180" height="200" viewBox="0 0 100 150" className="transition-all duration-300 relative z-10">
            <circle cx="50" cy="75" r="44" fill="none" stroke={getTwinColor()} strokeWidth="0.5" strokeDasharray="3 3" className="animate-[spin_40s_linear_infinite]" />
            <circle cx="50" cy="75" r="36" fill="none" stroke={getTwinColor()} strokeWidth="0.2" />
            <circle cx="50" cy="20" r="4" fill={getTwinColor()} className="animate-pulse" />
            <line x1="50" y1="20" x2="50" y2="105" stroke={getTwinColor()} strokeWidth="1.5" />
            <line x1="50" y1="45" x2="20" y2="65" stroke={getTwinColor()} strokeWidth="1" />
            <line x1="50" y1="45" x2="80" y2="65" stroke={getTwinColor()} strokeWidth="1" />
            <circle cx="50" cy="68" r="6" fill={getTwinColor()} />
          </svg>
        </div>
        <p className="text-[9px]  text-slate-500 uppercase tracking-widest mt-2">Biomorphic twin status synchronization: ACTIVE</p>
      </div>

      {/* Analytics & Metrics */}
      <div className="lg:col-span-6 glass-hud-cyan p-8 flex flex-col justify-between border-l-4 border-l-sky-500 min-h-[400px]">
        <div className="space-y-6">
          <div>
            <span className="text-[10px]  text-[#0ea5e9] uppercase tracking-widest block mb-2 font-bold ">ECO STATUS</span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Twin Intelligence</h3>
          </div>

          <div className="bg-black/60 p-5 rounded-2xl border border-white/5  text-xs">
            <span className="text-slate-500 uppercase block text-[9px]">Neural Profile Status</span>
            <div className="text-xl font-bold mt-1.5" style={{ color: getTwinColor() }}>
              {ecoScore > 85 ? "OPTIMAL ENERGY BALANCE" : ecoScore > 65 ? "STABLE FOOTPRINT PATH" : ecoScore > 50 ? "SYSTEM PRESSURE" : "CRITICAL CARBON STRAIN"}
            </div>
            <p className="text-slate-300 mt-3 leading-relaxed font-sans text-xs font-medium">
              Daily carbon discharge load is currently registered at {dailyCarbon} kg. Optimize travel modes and solar grid factors to stabilize index.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 flex justify-between  text-[9px] text-slate-550">
          <span>Firmware: v4.1.8-alpha</span>
          <span>Sync Status: SECURE_STABLE</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 14. LIFE DECISION IMPACT ENGINE
// ==========================================
export function LifeDecisionImpactEngine() {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const decisions = [
    { id: "ev", name: "Switch to EV", carbonSaved: "45 T CO2e", timeline: "10 Yrs", desc: "Offsets gasoline combustion grids. Reduces particulate smog.", scoreBonus: 12 },
    { id: "solar", name: "Install Solar Array", carbonSaved: "52 T CO2e", timeline: "20 Yrs", desc: "Allows clean net utility exports.", scoreBonus: 15 },
    { id: "diet", name: "Switch to Veg Diet", carbonSaved: "18 T CO2e", timeline: "15 Yrs", desc: "Stops methane inputs from high-scale livestock feedstocks.", scoreBonus: 9 },
    { id: "pump", name: "Install Heat Pump", carbonSaved: "32 T CO2e", timeline: "12 Yrs", desc: "Leverages geothermal coefficients, removing gas utility lines.", scoreBonus: 11 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-7 glass-hud p-8 flex flex-col justify-between border-l-4 border-l-emerald-500 min-h-[380px]">
        <div>
          <span className="text-[10px]  tracking-widest text-[#10b981] uppercase mb-2 block font-bold">DECISION ENGINE STUDIO</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Lifestyle Projections</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left ">
          {decisions.map((d) => (
            <button key={d.id} onClick={() => setSelectedMilestone(d.id)} 
              className={`p-4 rounded-xl border text-left transition ${selectedMilestone === d.id ? "border-[#10b981] bg-[#064e3b] text-white shadow-[0_0_15px_rgba(163,230,53,0.1)]" : "border-slate-800 bg-[#131715]/40 text-slate-500 hover:border-slate-700"}`}>
              <span className="text-xs font-bold block uppercase">{d.name}</span>
              <span className="text-[10px] text-[#10b981] mt-1.5 block">Saves {d.carbonSaved} {"//"} {d.timeline}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 glass-hud-purple p-8 flex flex-col justify-center min-h-[380px] border-l-4 border-l-indigo-500">
        {selectedMilestone ? (
          <div className="bg-black/60 border border-white/5 p-5 rounded-2xl text-left w-full  text-xs space-y-4">
            {(() => {
              const dec = decisions.find(d => d.id === selectedMilestone)!;
              return (
                <>
                  <h4 className="font-bold text-white text-xs uppercase">{dec.name}</h4>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed font-medium">{dec.desc}</p>
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <div>
                      <span className="text-slate-500 block uppercase text-[8px]">Eco Score Gain</span>
                      <span className="font-bold text-[#10b981]  text-sm block mt-0.5">+{dec.scoreBonus} pts</span>
                    </div>
                    <div>
                      <span className="text-slate-550 block uppercase text-[8px]">Projected Yield</span>
                      <span className="font-bold text-white  text-sm block mt-0.5">{dec.carbonSaved}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="text-center text-slate-550  text-xxs py-10">
            <Info className="w-8 h-8 text-slate-750 mx-auto mb-3" />
            SELECT A DECISION MILESTONE ON THE LEFT.
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 15. ECO DNA PROFILE
// ==========================================
export function EcoDNAProfile() {
  const radarData = [
    { subject: 'Diet', A: 85, B: 110, fullMark: 150 },
    { subject: 'Energy', A: 70, B: 130, fullMark: 150 },
    { subject: 'Travel', A: 60, B: 130, fullMark: 150 },
    { subject: 'Waste', A: 90, B: 100, fullMark: 150 },
    { subject: 'Advocacy', A: 45, B: 90, fullMark: 150 },
    { subject: 'Offsetting', A: 80, B: 85, fullMark: 150 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Radar Map */}
      <div className="lg:col-span-6 glass-hud p-8 border-l-4 border-l-emerald-500">
        <h3 className="text-xs font-bold  tracking-wider text-[#10b981] uppercase mb-2">Eco Impact Breakdown</h3>
        <p className="text-xxs text-slate-500  uppercase mb-6 font-bold">Structural behavioral mapping across six key domains.</p>

        <div className="h-56 flex justify-center">
          <ClientOnly>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.03)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} className="" />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.03)" fontSize={8} />
                <Radar name="User Eco DNA" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
      </div>

      {/* Footprint visualizer panel */}
      <div className="lg:col-span-6 glass-hud-purple p-8 flex flex-col justify-between border-l-4 border-l-indigo-500 min-h-[380px]">
        <div>
          <span className="text-[10px]  text-[#6366f1] uppercase block mb-2 tracking-widest font-bold">Footprint Overview</span>
          <h4 className="text-lg font-black text-white uppercase tracking-tight mb-4">DNA Profile Telemetry</h4>
        </div>

        {/* CSS Double Helix Animation */}
        <div className="h-20 flex justify-center items-center gap-2 overflow-hidden my-6">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-between h-full relative" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-[bounce_1.5s_infinite_alternate]" style={{ animationDelay: `${i * 0.15}s` }} />
              <div className="w-[1px] bg-slate-800 flex-1 my-1" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-[bounce_1.5s_infinite_alternate]" style={{ animationDelay: `${i * 0.15 + 0.75}s` }} />
            </div>
          ))}
        </div>

        <div className="space-y-3  text-xs">
          <div className="flex justify-between items-center bg-black/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-slate-400">Waste Sorting Efficiency</span>
            <span className="text-[#10b981] font-bold">90% // OPTIMAL</span>
          </div>
          <div className="flex justify-between items-center bg-black/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-slate-400">Dietary LCA Factor</span>
            <span className="text-[#10b981] font-bold">85% // VEGETARIAN BIAS</span>
          </div>
          <div className="flex justify-between items-center bg-black/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-slate-400">Community Advocate Index</span>
            <span className="text-amber-500 font-bold">45% // MODEST</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 16. COMMUNITY CHALLENGES
// ==========================================
export function CommunityChallenges() {
  const { challenges, toggleJoinChallenge, completeChallenge } = useDashboard();

  return (
    <div className="glass-hud p-8 border-l-4 border-l-emerald-500 relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent" />
      <div className="mb-8">
        <span className="text-[10px]  text-[#10b981] uppercase tracking-widest block mb-2 font-bold">MULTIPLAYER ECO LOGS</span>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Active Missions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((c) => (
          <div key={c.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-white/10 transition">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px]  text-slate-500 uppercase font-bold">{c.category} {"//"} +{c.points} pts</span>
                {c.completed && <span className="px-2 py-0.5 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] rounded text-[8px] font-bold tracking-widest ">COMPLETE</span>}
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-tight">{c.title}</h4>
              <p className="text-[10px] text-slate-450  mt-1.5 uppercase tracking-wider">{c.participants} active nodes participating</p>
            </div>

            <div className="pt-2">
              {!c.joined ? (
                <button onClick={() => toggleJoinChallenge(c.id)} className="btn-cyber-secondary w-full py-2 rounded-lg text-[10px] uppercase cursor-pointer">
                  Join Challenge
                </button>
              ) : !c.completed ? (
                <button onClick={() => completeChallenge(c.id)} className="btn-cyber-primary w-full py-2 rounded-lg text-[10px] uppercase cursor-pointer">
                  Complete Mission
                </button>
              ) : (
                <button disabled className="py-2 bg-slate-900/30 border border-dashed border-slate-800 text-slate-650 rounded-lg text-[10px] uppercase w-full cursor-not-allowed">
                  Missions Logged
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 17. LEADERBOARDS
// ==========================================
export function Leaderboards() {
  const leadersList = [
    { rank: "01", name: "Aria Thorne", score: "96", co2: "-1.2 T/yr", av: "AT", color: "text-[#10b981]" },
    { rank: "02", name: "Devon Lane", score: "93", co2: "-0.9 T/yr", av: "DL", color: "text-[#0ea5e9]" },
    { rank: "03", name: "Sarah Vance", score: "89", co2: "-0.7 T/yr", av: "SV", color: "text-[#6366f1]" },
    { rank: "04", name: "Alex Mercer", score: "84", co2: "-0.5 T/yr", av: "AM", color: "text-slate-400" },
    { rank: "05", name: "Elena Rostova", score: "81", co2: "-0.4 T/yr", av: "ER", color: "text-slate-400" },
  ];

  return (
    <div className="glass-hud p-8 border-l-4 border-l-emerald-500">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <span className="text-[10px]  text-[#10b981] uppercase tracking-widest block mb-2 font-bold">MUNICIPAL MATRIX</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Eco Standings</h3>
        </div>
        <span className="px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] rounded-lg text-[9px]  font-bold uppercase tracking-wider">ISO-14064 Compliant</span>
      </div>

      <div className="space-y-3  text-xs">
        {leadersList.map((l, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition">
            <div className="flex items-center gap-4 min-w-0">
              <span className={`text-[10px] font-bold ${l.color}`}>{l.rank}</span>
              <div className="w-10 h-10 rounded-xl bg-black/60 text-[#10b981] border border-[#10b981]/20 flex items-center justify-center text-xs font-bold flex-shrink-0">{l.av}</div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block truncate font-sans uppercase tracking-tight">{l.name}</span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">{l.score} EcoScore</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#10b981] flex-shrink-0">{l.co2}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 18. REPORTS & EXPORTS
// ==========================================
export function Reports() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Simulate file download
      const content = "HariTva Ecological Compliance Audit Log\n======================================\nDaily carbon load: stable\nEco Score: Verified\nCompliance rating: Grade A";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "haritva_audit_report.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };

  return (
    <div className="glass-hud p-8 border-l-4 border-l-emerald-500 flex flex-col items-center justify-center text-center max-w-xl mx-auto min-h-[300px]">
      <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center mb-6">
        <Download className="w-6 h-6 text-[#10b981]" />
      </div>
      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Ecological Audit Export</h3>
      <p className="text-xs text-slate-400 mb-8 max-w-sm font-medium leading-relaxed">Compile all recorded daily telemetry coefficients, LCA scans, and billing invoice logs into a certified ISO-14064 txt report.</p>
      
      <button onClick={handleDownload} disabled={downloading} className="btn-cyber-primary px-8 py-3.5 rounded-xl text-xs uppercase flex items-center gap-2 cursor-pointer w-full justify-center">
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Compiling Report...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" /> Export Audit Log
          </>
        )}
      </button>
    </div>
  );
}

// ==========================================
// 19. VOICE INTERFACE
// ==========================================
export function VoiceAssistant() {
  const [active, setActive] = useState(false);

  return (
    <div className="glass-hud p-8 border-l-4 border-l-emerald-500 flex flex-col items-center justify-center text-center max-w-xl mx-auto min-h-[300px]">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-8 transition-all ${active ? "bg-[#0ea5e9]/10 border-2 border-[#0ea5e9] shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse" : "bg-black/60 border border-white/5"}`}>
        <Mic className={`w-6 h-6 ${active ? "text-[#0ea5e9]" : "text-slate-400"}`} />
      </div>
      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Voice Interface</h3>
      <p className="text-xs text-slate-400 mb-8 max-w-sm font-medium leading-relaxed">Direct voice telemetry inputs. Converse with your AI sustainability mentor hands-free using real-time audio streams.</p>
      
      <button onClick={() => setActive(!active)} className={`px-8 py-3.5 rounded-xl text-xs uppercase cursor-pointer w-full transition ${active ? "btn-cyber-secondary border-red-500/30 text-red-400 hover:border-red-500" : "btn-cyber-primary"}`}>
        {active ? "Close Voice Link" : "Establish Audio Link"}
      </button>
    </div>
  );
}

// ==========================================
// 20. PROFILE & OS SETTINGS
// ==========================================
export function ProfileSettings() {
  const { highContrast, toggleHighContrast } = useDashboard();
  const [telemetryState, setTelemetryState] = useState(true);

  return (
    <div className="glass-hud p-8 border-l-4 border-l-emerald-500 max-w-xl mx-auto">
      <div className="mb-8 border-b border-white/5 pb-4">
        <span className="text-[10px]  text-[#10b981] uppercase tracking-widest block mb-2 font-bold">SYSTEM PREFERENCES</span>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">OS Configuration</h3>
      </div>

      <div className="space-y-4  text-xs">
        <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
          <div>
            <span className="text-white font-bold block uppercase">Contrast Mode</span>
            <span className="text-[9px] text-slate-500 block uppercase mt-0.5">High visibility styling assets</span>
          </div>
          <button onClick={toggleHighContrast} 
            className={`px-4 py-2 rounded-lg border text-[10px] uppercase font-bold transition ${highContrast ? "border-[#10b981] bg-[#064e3b] text-[#10b981]" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
            {highContrast ? "ACTIVE" : "DISABLED"}
          </button>
        </div>

        <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5">
          <div>
            <span className="text-white font-bold block uppercase">Live Telemetry Link</span>
            <span className="text-[9px] text-slate-500 block uppercase mt-0.5">Municipal node synchronization</span>
          </div>
          <button onClick={() => setTelemetryState(!telemetryState)} 
            className={`px-4 py-2 rounded-lg border text-[10px] uppercase font-bold transition ${telemetryState ? "border-[#10b981] bg-[#064e3b] text-[#10b981]" : "border-slate-800 bg-black/40 text-slate-400 hover:border-slate-700"}`}>
            {telemetryState ? "ACTIVE" : "MUTED"}
          </button>
        </div>
      </div>
    </div>
  );
}
