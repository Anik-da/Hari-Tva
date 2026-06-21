"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";

export interface Challenge {
  id: string;
  title: string;
  category: string;
  points: number;
  participants: number;
  joined: boolean;
  completed: boolean;
}

export interface DashboardContextType {
  ecoScore: number;
  setEcoScore: (score: number | ((prev: number) => number)) => void;
  dailyCarbon: number; // in kg
  setDailyCarbon: (kg: number | ((prev: number) => number)) => void;
  monthlyCarbon: number; // in kg
  setMonthlyCarbon: (kg: number | ((prev: number) => number)) => void;
  annualCarbon: number; // in metric tonnes
  setAnnualCarbon: (tonnes: number | ((prev: number) => number)) => void;
  
  // Custom slider choices for simulator states
  solarPercent: number;
  setSolarPercent: (p: number) => void;
  meatlessDays: number;
  setMeatlessDays: (d: number) => void;
  evPercent: number;
  setEvPercent: (p: number) => void;
  flightsSaved: number;
  setFlightsSaved: (f: number) => void;
  
  // High contrast mode for accessibility
  highContrast: boolean;
  toggleHighContrast: () => void;
  
  // Challenges & Missions
  challenges: Challenge[];
  toggleJoinChallenge: (id: string) => void;
  completeChallenge: (id: string) => void;
  
  // Helper to trigger confetti celebration
  triggerCelebration: () => void;
}

const defaultChallenges: Challenge[] = [
  { id: "1", title: "Zero Plastic Week", category: "Waste", points: 150, participants: 1420, joined: false, completed: false },
  { id: "2", title: "100% Plant-Based Weekends", category: "Food", points: 200, participants: 840, joined: false, completed: false },
  { id: "3", title: "Commute via Cycle/Transit", category: "Travel", points: 180, participants: 2150, joined: false, completed: false },
  { id: "4", title: "Vampire Power Shutdown", category: "Energy", points: 100, participants: 3200, joined: false, completed: false },
  { id: "5", title: "Carbon Offset Champion", category: "Offset", points: 250, participants: 520, joined: false, completed: false },
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [ecoScore, setEcoScore] = useState<number>(76);
  const [dailyCarbon, setDailyCarbon] = useState<number>(14.2);
  const [monthlyCarbon, setMonthlyCarbon] = useState<number>(426);
  const [annualCarbon, setAnnualCarbon] = useState<number>(5.11);
  
  // Slider states for What-If simulator
  const [solarPercent, setSolarPercent] = useState<number>(20);
  const [meatlessDays, setMeatlessDays] = useState<number>(1);
  const [evPercent, setEvPercent] = useState<number>(10);
  const [flightsSaved, setFlightsSaved] = useState<number>(0);
  
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [challenges, setChallenges] = useState<Challenge[]>(defaultChallenges);

  // Synchronize base values when What-If parameters change
  useEffect(() => {
    // Standard baseline: 18kg daily carbon, 540kg monthly, 6.5 tonnes annual
    // Reduce emissions based on active simulator variables
    const solarReduction = (solarPercent / 100) * 3.5; // Up to 3.5kg saved
    const dietReduction = meatlessDays * 1.2; // Up to 8.4kg saved (if 7 days)
    const travelReduction = (evPercent / 100) * 4.0; // Up to 4.0kg saved
    const flightReduction = (flightsSaved * 400) / 365; // Flight hours saved scaled daily

    const totalSavedDaily = solarReduction + dietReduction + travelReduction + flightReduction;
    const newDaily = Math.max(4.2, parseFloat((18.0 - totalSavedDaily).toFixed(1)));
    
    setDailyCarbon(newDaily);
    setMonthlyCarbon(Math.round(newDaily * 30));
    setAnnualCarbon(parseFloat(((newDaily * 365) / 1000).toFixed(2)));

    // Update eco score dynamically: baseline score is 50, maximum is 99
    const scoreBonus = Math.min(49, Math.round((totalSavedDaily / 14) * 49));
    setEcoScore(50 + scoreBonus);
  }, [solarPercent, meatlessDays, evPercent, flightsSaved]);

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        if (next) {
          document.documentElement.classList.add("high-contrast-mode");
        } else {
          document.documentElement.classList.remove("high-contrast-mode");
        }
      }
      return next;
    });
  };

  const toggleJoinChallenge = (id: string) => {
    setChallenges(prev =>
      prev.map(c => (c.id === id ? { ...c, joined: !c.joined, participants: c.joined ? c.participants - 1 : c.participants + 1 } : c))
    );
  };

  const completeChallenge = (id: string) => {
    setChallenges(prev =>
      prev.map(c => {
        if (c.id === id && !c.completed) {
          triggerCelebration();
          // Boost eco score slightly upon completion
          setEcoScore(score => Math.min(99, score + 3));
          return { ...c, completed: true, points: c.points };
        }
        return c;
      })
    );
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#06b6d4", "#ffffff", "#042f1a"],
    });
  };

  return (
    <DashboardContext.Provider
      value={{
        ecoScore,
        setEcoScore,
        dailyCarbon,
        setDailyCarbon,
        monthlyCarbon,
        setMonthlyCarbon,
        annualCarbon,
        setAnnualCarbon,
        solarPercent,
        setSolarPercent,
        meatlessDays,
        setMeatlessDays,
        evPercent,
        setEvPercent,
        flightsSaved,
        setFlightsSaved,
        highContrast,
        toggleHighContrast,
        challenges,
        toggleJoinChallenge,
        completeChallenge,
        triggerCelebration,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
