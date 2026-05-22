"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, CalendarDays,
  ArrowRight, CalendarPlus, AlertCircle, Calendar, Zap,
  Target, Star, TrendingUp, Brain, Sparkles, Award,
  Timer, Briefcase, Heart, Coffee, Flame, LogIn,
  BarChart3, ChevronRight, Bell, Gift,
} from "lucide-react";


interface DashboardData {
  leaveBalance: { total_cl: number; used_cl: number; remaining_cl: number; month: number; year: number };
  pendingLeaves: number;
  approvedLeaves: number;
  recentLeaves: { id: number; start_date: string; end_date: string; reason: string; status: string; applied_at: string }[];
}

// Circular Progress
function CircularProgress({ value, max, size = 100, strokeWidth = 10, color = "#10b981" }: { value: number; max: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? value / max : 0;
  const offset = circumference * (1 - progress);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <motion.circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{value}</span>
        <span className="text-[9px] text-slate-500">of {max}</span>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboard();
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening");
    const user = localStorage.getItem("user");
    if (user) { const u = JSON.parse(user); setUserName(u.name || u.username || ""); }
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard/employee");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) { console.error("Dashboard fetch error:", error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const remaining = data?.leaveBalance?.remaining_cl ?? 2;
  const total = data?.leaveBalance?.total_cl || 2;
  const used = data?.leaveBalance?.used_cl || 0;
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];


  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 lg:p-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-300/20 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-emerald-100 text-sm font-medium">{greeting} 👋</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">{userName || "Employee"}</h2>
            <p className="text-emerald-100/80 text-sm mt-2">{monthNames[(data?.leaveBalance?.month || 1) - 1]} {data?.leaveBalance?.year} &middot; Your personal workspace</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-xs text-emerald-100 font-medium">Online</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                <Clock className="w-3.5 h-3.5 text-emerald-200" />
                <span className="text-xs text-emerald-100 font-medium">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/employee/apply-leave" className="px-5 py-3 rounded-xl bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2">
              <CalendarPlus className="w-4 h-4" /> Apply Leave
            </Link>
            <Link href="/employee/attendance" className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all flex items-center gap-2">
              <LogIn className="w-4 h-4" /> Check In
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Leave Balance", value: `${remaining} CL`, sub: `of ${total} this month`, icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-50", href: "/employee/apply-leave" },
          { label: "Pending Requests", value: String(data?.pendingLeaves || 0), sub: "awaiting approval", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", href: "/employee/leaves" },
          { label: "Approved Leaves", value: String(data?.approvedLeaves || 0), sub: "this cycle", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", href: "/employee/leaves" },
          { label: "Attendance Rate", value: "95%", sub: "this month", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50", href: "/employee/attendance" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <Link href={stat.href} className="card-enterprise p-5 flex items-center gap-4 group hover:shadow-md transition-all block">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>


      {/* Main Grid: Leave Balance + Quick Actions + Recent */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Leave Balance Visual */}
        <motion.div className="lg:col-span-4 card-enterprise p-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-sm font-semibold text-slate-500 mb-4">Monthly Leave Balance</p>
          <CircularProgress value={remaining} max={total} size={120} color="#10b981" />
          <div className="flex items-center gap-6 mt-5">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{remaining}</p>
              <p className="text-[11px] text-slate-500">Available</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{used}</p>
              <p className="text-[11px] text-slate-500">Used</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-slate-600">{total}</p>
              <p className="text-[11px] text-slate-500">Total</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 text-center">Resets on 1st of every month</p>
        </motion.div>

        {/* Self-Service Quick Actions */}
        <motion.div className="lg:col-span-4 card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Self-Service Portal</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Apply Leave", icon: CalendarPlus, href: "/employee/apply-leave", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100" },
              { label: "Attendance", icon: Timer, href: "/employee/attendance", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
              { label: "Performance", icon: Target, href: "/employee/performance", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100" },
              { label: "AI Assistant", icon: Brain, href: "/employee/ai-assistant", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100" },
              { label: "My Profile", icon: Briefcase, href: "/employee/profile", color: "text-slate-600", bg: "bg-slate-100 hover:bg-slate-200" },
              { label: "Leave History", icon: CalendarCheck, href: "/employee/leaves", color: "text-teal-600", bg: "bg-teal-50 hover:bg-teal-100" },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.bg} border border-transparent hover:border-slate-200 transition-all group`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-[11px] font-medium text-slate-600 text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Highlights / Notifications */}
        <motion.div className="lg:col-span-4 card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Highlights</h3>
          <div className="space-y-3">
            {[
              { icon: Flame, color: "text-orange-500", bg: "bg-orange-50", text: "Your performance rating is 4.5/5 this quarter!", type: "Performance" },
              { icon: Gift, color: "text-pink-500", bg: "bg-pink-50", text: "Birthday leave available - use it within 30 days", type: "Benefit" },
              { icon: Bell, color: "text-blue-500", bg: "bg-blue-50", text: `${data?.pendingLeaves || 0} leave request(s) pending review`, type: "Leave" },
              { icon: Award, color: "text-emerald-500", bg: "bg-emerald-50", text: "95% attendance rate - excellent!", type: "Attendance" },
              { icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50", text: "New wellness program available - enroll now!", type: "Wellness" },
            ].map((item, i) => (
              <motion.div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed">{item.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>


      {/* Recent Leave Applications */}
      <motion.div className="card-enterprise" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">Recent Leave Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your latest requests</p>
          </div>
          <Link href="/employee/leaves" className="btn-ghost text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-sm">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {data?.recentLeaves && data.recentLeaves.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recentLeaves.slice(0, 4).map((leave, i) => (
              <motion.div key={leave.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.06 }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  leave.status === "approved" ? "bg-emerald-50 border border-emerald-100" :
                  leave.status === "rejected" ? "bg-red-50 border border-red-100" :
                  "bg-amber-50 border border-amber-100"
                }`}>
                  {leave.status === "approved" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                   leave.status === "rejected" ? <XCircle className="w-5 h-5 text-red-600" /> :
                   <Clock className="w-5 h-5 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {leave.start_date !== leave.end_date && ` - ${new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{leave.reason}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                    leave.status === "approved" ? "text-emerald-700 bg-emerald-50 border border-emerald-100" :
                    leave.status === "rejected" ? "text-red-700 bg-red-50 border border-red-100" :
                    "text-amber-700 bg-amber-50 border border-amber-100"
                  }`}>{leave.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <CalendarDays className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-600">No leave applications yet</p>
            <Link href="/employee/apply-leave" className="btn-success mt-3 text-sm">
              <CalendarPlus className="w-4 h-4" /> Apply Now
            </Link>
          </div>
        )}
      </motion.div>

      {/* Policy Reminder */}
      <motion.div className="card-enterprise p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-blue-100/50"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Leave Policy Reminder</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              You have <span className="font-bold text-emerald-700">{remaining} CL remaining</span> this month.
              Unused leaves do not carry forward and reset on the 1st. Plan accordingly!
            </p>
          </div>
          <Link href="/employee/apply-leave" className="ml-auto btn-primary text-xs flex-shrink-0">
            Apply <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
