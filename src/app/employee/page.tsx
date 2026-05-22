"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  CalendarDays,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  leaveBalance: {
    total_cl: number;
    used_cl: number;
    remaining_cl: number;
    month: number;
    year: number;
  };
  pendingLeaves: number;
  approvedLeaves: number;
  recentLeaves: {
    id: number;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    applied_at: string;
  }[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || user.username || "");
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard/employee");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 animate-pulse">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[(data?.leaveBalance?.month || 1) - 1];
  const remaining = data?.leaveBalance?.remaining_cl ?? 2;
  const total = data?.leaveBalance?.total_cl || 2;
  const used = data?.leaveBalance?.used_cl || 0;
  const percentage = (remaining / total) * 100;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.4),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.3),transparent_50%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <motion.div
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-100 text-sm font-medium">{currentMonth} {data?.leaveBalance?.year}</span>
            </motion.div>
            <motion.h1
              className="text-3xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Welcome back, {userName.split(" ")[0] || "Employee"}!
            </motion.h1>
            <motion.p
              className="text-emerald-100/80 mt-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Here&apos;s your leave summary and recent activity.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <Link
              href="/employee/apply-leave"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm border border-white/25 text-white font-medium rounded-xl hover:bg-white/25 transition-all shadow-lg"
            >
              <CalendarDays className="w-5 h-5" />
              Apply for Leave
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
        {/* Floating elements */}
        <motion.div
          className="absolute top-6 right-10 w-16 h-16 rounded-full bg-white/5 border border-white/10"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-6 right-40 w-10 h-10 rounded-lg bg-white/5 border border-white/10"
          animate={{ y: [0, 5, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total CL This Month",
            value: total,
            icon: CalendarCheck,
            gradient: "from-blue-500 to-blue-600",
            glow: "shadow-blue-500/20",
          },
          {
            label: "Remaining CL",
            value: remaining,
            icon: CheckCircle,
            gradient: "from-emerald-500 to-emerald-600",
            glow: "shadow-emerald-500/20",
          },
          {
            label: "Pending Requests",
            value: data?.pendingLeaves || 0,
            icon: Clock,
            gradient: "from-amber-500 to-orange-500",
            glow: "shadow-amber-500/20",
          },
          {
            label: "Used This Month",
            value: used,
            icon: Calendar,
            gradient: "from-violet-500 to-purple-600",
            glow: "shadow-violet-500/20",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative bg-white rounded-2xl p-6 border border-slate-100 shadow-lg ${stat.glow} hover:shadow-xl transition-all duration-300 overflow-hidden group`}
          >
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-r ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className="relative z-10">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-md ${stat.glow} mb-4`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <motion.p
                className="text-3xl font-bold text-slate-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leave Balance Visual + Quick Info */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Balance Visual */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Monthly Leave Balance</h3>
              <p className="text-xs text-slate-500">{currentMonth} {data?.leaveBalance?.year}</p>
            </div>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 2.51} 251`}
                  initial={{ strokeDasharray: "0 251" }}
                  animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{remaining}</span>
                <span className="text-xs text-slate-500">of {total}</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-sm text-emerald-700 font-medium">Available</span>
                <span className="text-lg font-bold text-emerald-700">{remaining} CL</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-sm text-amber-700 font-medium">Used</span>
                <span className="text-lg font-bold text-amber-700">{used} CL</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm text-blue-700 font-medium">Total</span>
                <span className="text-lg font-bold text-blue-700">{total} CL</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Policy:</span> Unused leaves do not carry forward. Balance resets on 1st of every month.
            </p>
          </div>
        </motion.div>

        {/* Recent Leaves */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Recent Applications</h3>
                <p className="text-xs text-slate-500">Your latest leave requests</p>
              </div>
            </div>
            <Link href="/employee/leaves" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {data?.recentLeaves && data.recentLeaves.length > 0 ? (
            <div className="space-y-3">
              {data.recentLeaves.map((leave, i) => (
                <motion.div
                  key={leave.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-all group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      leave.status === "approved" ? "bg-emerald-100" :
                      leave.status === "rejected" ? "bg-red-100" : "bg-amber-100"
                    }`}>
                      {leave.status === "approved" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                       leave.status === "rejected" ? <Clock className="w-5 h-5 text-red-600" /> :
                       <Clock className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {leave.start_date !== leave.end_date && (
                          <span className="text-slate-400"> — {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{leave.reason}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                    leave.status === "approved" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                    leave.status === "rejected" ? "bg-red-100 text-red-700 border border-red-200" :
                    "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <CalendarDays className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">No leave applications yet</p>
              <p className="text-xs mt-1">Apply for leave to see history here</p>
              <Link
                href="/employee/apply-leave"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                Apply Now
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
