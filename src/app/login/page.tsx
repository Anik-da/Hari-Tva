"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { Leaf, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => { if (user) router.push("/dashboard"); });
    return () => unsub();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try { await signInWithEmailAndPassword(auth, email, password); router.push("/dashboard"); }
    catch (err) { const e = err as { code?: string; message?: string }; setError(e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password" ? "Invalid email or password." : e.message || "Authentication error."); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (!email || !password || !confirmPassword || !fullName) { setError("Please fill in all fields."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        await updateProfile(res.user, { displayName: fullName });
      }
      setSuccess("Registered! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    }
    catch (err) { const e = err as { code?: string; message?: string }; setError(e.code === "auth/email-already-in-use" ? "Email already in use." : e.message || "Registration error."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(null); setLoading(true);
    try { await signInWithPopup(auth, new GoogleAuthProvider()); router.push("/dashboard"); }
    catch (err) { const e = err as { code?: string; message?: string }; if (e.code !== "auth/popup-closed-by-user") setError(e.message || "Google sign-in error."); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!resetEmail) { setError("Enter your email."); return; }
    try { await sendPasswordResetEmail(auth, resetEmail); setSuccess("Reset link sent!"); setShowResetModal(false); setResetEmail(""); }
    catch (err) { const e = err as { message?: string }; setError(e.message || "Could not send reset email."); }
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] flex items-center justify-center p-8 overflow-hidden">
      {/* Ambient lighting */}
      <div className="glow-blob-green top-[-10%] right-[-10%] opacity-20" />
      <div className="glow-blob-purple bottom-[-10%] left-[-10%] opacity-15" />

      <div className="w-full max-w-md z-10 space-y-8">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
              <Leaf className="text-emerald-500 w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white uppercase">HariTva</span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">Log in to the sustainability platform</p>
        </div>

        {/* Auth Card */}
        <div className="glass-hud p-8 w-full relative overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5 mb-8 relative">
            <button onClick={() => { setActiveTab("signin"); setError(null); }} className={`flex-1 pb-4 text-sm font-semibold tracking-wide transition ${activeTab === "signin" ? "text-emerald-400" : "text-slate-500 hover:text-slate-350"}`}>
              Sign In
            </button>
            <button onClick={() => { setActiveTab("register"); setError(null); }} className={`flex-1 pb-4 text-sm font-semibold tracking-wide transition ${activeTab === "register" ? "text-emerald-400" : "text-slate-500 hover:text-slate-350"}`}>
              Register
            </button>
            <div className="absolute bottom-0 h-[2px] bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: "50%", left: activeTab === "signin" ? "0%" : "50%" }} />
          </div>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-sm text-red-400 flex items-center gap-3 mb-6">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-3 mb-6">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" /><span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={activeTab === "signin" ? handleSignIn : handleRegister} className="space-y-5">
            {activeTab === "register" && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-xs text-slate-400 uppercase font-semibold tracking-wide flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
                <input id="fullName" type="text" placeholder="Aria Thorne" value={fullName} onChange={e => setFullName(e.target.value)} className="glass-input w-full" required />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs text-slate-400 uppercase font-semibold tracking-wide flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
              <input id="email" type="email" placeholder="aria@environment.org" value={email} onChange={e => setEmail(e.target.value)} className="glass-input w-full" required />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs text-slate-400 uppercase font-semibold tracking-wide flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Password</label>
                {activeTab === "signin" && <button type="button" onClick={() => { setShowResetModal(true); setError(null); setSuccess(null); }} className="text-xs text-slate-500 hover:text-emerald-400 transition">Forgot?</button>}
              </div>
              <input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="glass-input w-full" required />
            </div>
            {activeTab === "register" && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-xs text-slate-400 uppercase font-semibold tracking-wide flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Confirm Password</label>
                <input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="glass-input w-full" required />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-emerald-500 text-black font-semibold rounded-xl text-sm hover:bg-emerald-450 transition-all flex items-center justify-center gap-2 shadow-md mt-2 cursor-pointer">
              {loading ? "Authenticating..." : activeTab === "signin" ? "Sign In" : "Register"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <span className="relative bg-[#07090e] px-4 text-xs text-slate-500 uppercase tracking-wider font-semibold">or</span>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full py-3.5 bg-white/5 border border-white/10 text-slate-300 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-3 hover:border-white/15">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center leading-relaxed">
          By signing in, you agree to our environmental compliance terms of service.
        </p>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-hud p-8 w-full max-w-sm relative">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-emerald-400" /> Reset Password</h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">Enter your email and we&apos;ll send reset instructions.</p>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="resetEmail" className="text-xs text-slate-400 uppercase font-semibold tracking-wide flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</label>
                <input id="resetEmail" type="email" placeholder="aria@environment.org" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="glass-input w-full" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-400 text-sm font-semibold rounded-xl hover:text-white transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-500 text-black text-sm font-bold rounded-xl hover:bg-emerald-450 transition">Send Link</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
