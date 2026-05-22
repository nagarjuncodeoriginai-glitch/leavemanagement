"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarCheck, Clock, CheckCircle, XCircle, CalendarDays,
  ArrowRight, TrendingUp, CalendarPlus, Sparkles, Target,
  AlertCircle, Calendar, Zap, BarChart3,
} from "lucide-react";

interface DashboardData {
  leaveBalance: { total_cl: number; used_cl: number; remaining_cl: number; month: number; year: number; };
  pendingLeaves: number;
  approvedLeaves: number;
  recentLeaves: { id: number; start_date: string; end_date: string; reason: string; status: string; applied_at: string; }[];
}


// Circular Progress component
function CircularProgress({ value, max, size = 140, strokeWidth = 12 }: { value: number; max: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? (value / max) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const color = progress > 0.5 ? "#10b981" : progress > 0.25 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-xs text-slate-500 font-medium">of {max} CL</span>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard/employee");
      const json = await res.json();
      if (json.success) { setData(json.data); }
    } catch (error) { console.error("Dashboard fetch error:", error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="card-enterprise p-6"><div className="skeleton h-32 w-full rounded-xl" /></div>)}
        </div>
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const remaining = data?.leaveBalance?.remaining_cl ?? 2;
  const total = data?.leaveBalance?.total_cl || 2;
  const used = data?.leaveBalance?.used_cl || 0;


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Leave Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            {monthNames[(data?.leaveBalance?.month || 1) - 1]} {data?.leaveBalance?.year} &middot; Track your leave balance and requests
          </p>
        </div>
        <Link href="/employee/apply-leave" className="btn-success shadow-lg shadow-emerald-500/20">
          <CalendarPlus className="w-4 h-4" />
          Apply for Leave
        </Link>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Leave Balance Card - Hero */}
        <motion.div className="lg:col-span-1 card-enterprise-elevated p-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold text-slate-500 mb-4">Monthly Leave Balance</p>
          <CircularProgress value={remaining} max={total} />
          <div className="mt-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{remaining}</p>
              <p className="text-[11px] text-slate-500 font-medium">Available</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{used}</p>
              <p className="text-[11px] text-slate-500 font-medium">Used</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-slate-600">{total}</p>
              <p className="text-[11px] text-slate-500 font-medium">Total</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Pending */}
          <div className="card-enterprise p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-slate-900">{data?.pendingLeaves || 0}</p>
              <p className="text-sm text-slate-500">Pending Requests</p>
            </div>
            {(data?.pendingLeaves || 0) > 0 && <span className="badge-warning"><Zap className="w-3 h-3" />Active</span>}
          </div>

          {/* Approved */}
          <div className="card-enterprise p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-slate-900">{data?.approvedLeaves || 0}</p>
              <p className="text-sm text-slate-500">Approved Leaves</p>
            </div>
          </div>

          {/* Policy Info */}
          <div className="sm:col-span-2 card-enterprise p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-blue-100/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Leave Policy</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  You are allocated <span className="font-semibold">2 Casual Leaves per month</span>. 
                  Unused leaves do not carry forward and reset on the 1st of every month. Plan your leaves accordingly.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>


      {/* Recent Leaves */}
      <motion.div className="card-enterprise" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">Recent Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your latest leave requests</p>
          </div>
          <Link href="/employee/leaves" className="btn-ghost text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {data?.recentLeaves && data.recentLeaves.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recentLeaves.map((leave, i) => (
              <motion.div key={leave.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  leave.status === "approved" ? "bg-emerald-50" : leave.status === "rejected" ? "bg-red-50" : "bg-amber-50"}`}>
                  {leave.status === "approved" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                   leave.status === "rejected" ? <XCircle className="w-5 h-5 text-red-600" /> :
                   <Clock className="w-5 h-5 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {leave.start_date !== leave.end_date && (
                        <> — {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{leave.reason}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={leave.status === "approved" ? "badge-success" : leave.status === "rejected" ? "badge-danger" : "badge-warning"}>
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {new Date(leave.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <CalendarDays className="w-7 h-7" />
            </div>
            <p className="font-medium text-slate-600">No leave applications yet</p>
            <p className="text-sm mt-1">Your leave history will appear here</p>
            <Link href="/employee/apply-leave" className="btn-primary mt-4">
              <CalendarPlus className="w-4 h-4" /> Apply for Leave
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
