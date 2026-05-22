"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CalendarDays, Send, AlertCircle, CheckCircle2,
  Calendar, Clock, FileText, ArrowLeft, Info,
  Sparkles, Shield,
} from "lucide-react";
import Link from "next/link";


export default function ApplyLeavePage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [balance, setBalance] = useState<{ remaining_cl: number; total_cl: number } | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/leaves/balance");
        const json = await res.json();
        if (json.success) setBalance(json.data);
      } catch {}
    };
    fetchBalance();
  }, []);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leave_type: "CL", start_date: startDate, end_date: endDate, reason }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("Leave application submitted successfully!");
        setTimeout(() => router.push("/employee/leaves"), 2000);
      } else { setError(json.message || "Failed to submit leave application"); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const days = calculateDays();
  const canProceed = step === 0 ? (startDate && endDate && days > 0) : reason.length >= 10;


  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Link href="/employee" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <motion.div className="lg:col-span-2 card-enterprise-elevated overflow-hidden"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Apply for Leave</h2>
                <p className="text-sm text-slate-500 mt-0.5">Submit your casual leave request</p>
              </div>
            </div>
            {/* Step indicator */}
            <div className="flex items-center gap-3 mt-5">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${step >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                <Calendar className="w-3.5 h-3.5" /> Dates
              </div>
              <div className="w-6 h-0.5 bg-slate-200 rounded-full" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${step >= 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                <FileText className="w-3.5 h-3.5" /> Details
              </div>
              <div className="w-6 h-0.5 bg-slate-200 rounded-full" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${success ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Done
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}
            {success && (
              <motion.div className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 border border-emerald-100 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-emerald-700 font-medium">{success}</span>
              </motion.div>
            )}


            {/* Step 0: Dates */}
            {step === 0 && (
              <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]} required className="input-enterprise" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]} required className="input-enterprise" />
                  </div>
                </div>

                {days > 0 && (
                  <motion.div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Duration: {days} day{days > 1 ? "s" : ""}</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        {new Date(startDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                        {days > 1 && <> to {new Date(endDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</>}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Type</p>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1">Casual Leave (CL)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Maximum 2 CL per month</p>
                </div>

                <button type="button" onClick={() => setStep(1)} disabled={!canProceed}
                  className="btn-primary w-full py-3 disabled:opacity-40">
                  Continue to Details <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </motion.div>
            )}

            {/* Step 1: Reason */}
            {step === 1 && (
              <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Leave</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={5} required minLength={10}
                    placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)..."
                    className="input-enterprise resize-none" />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-slate-400">{reason.length} characters</p>
                    <p className={`text-xs ${reason.length >= 10 ? "text-emerald-500" : "text-slate-400"}`}>
                      {reason.length >= 10 ? "Minimum met" : `${10 - reason.length} more needed`}
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</p>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Dates:</span><span className="font-medium text-slate-800">{new Date(startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Duration:</span><span className="font-medium text-slate-800">{days} day{days > 1 ? "s" : ""}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Type:</span><span className="font-medium text-slate-800">Casual Leave</span></div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={loading || reason.length < 10} className="btn-success flex-1 py-3 disabled:opacity-40">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Submit Application</>}
                  </button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>


        {/* Sidebar Info */}
        <motion.div className="lg:col-span-1 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Balance Card */}
          <div className="card-enterprise p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Leave Balance</p>
                <p className="text-[11px] text-slate-500">This month</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <span className="text-sm text-emerald-700 font-medium">Available CL</span>
              <span className="text-xl font-bold text-emerald-700">{balance?.remaining_cl ?? 2}</span>
            </div>
          </div>

          {/* Policy Card */}
          <div className="card-enterprise p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Leave Policy</p>
            </div>
            <ul className="space-y-2.5">
              {[
                "2 CL allocated per month",
                "Unused leaves do not carry forward",
                "Balance resets on 1st of each month",
                "Minimum 10 char reason required",
                "HR reviews within 24 hours",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
