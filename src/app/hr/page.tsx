"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Clock,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Activity,
  Briefcase,
  PieChart,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  approvedLeavesThisMonth: number;
  departmentWise: { department: string; count: number }[];
  recentLeaves: {
    id: number;
    employee_name: string;
    emp_id: string;
    start_date: string;
    end_date: string;
    status: string;
    reason: string;
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

export default function HRDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard/hr");
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
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 animate-pulse">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Employees",
      value: data?.totalEmployees || 0,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGlow: "shadow-blue-500/20",
      lightBg: "bg-blue-50",
      change: "+12%",
    },
    {
      label: "Active Employees",
      value: data?.activeEmployees || 0,
      icon: UserCheck,
      gradient: "from-emerald-500 to-emerald-600",
      bgGlow: "shadow-emerald-500/20",
      lightBg: "bg-emerald-50",
      change: "+5%",
    },
    {
      label: "Pending Leaves",
      value: data?.pendingLeaves || 0,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "shadow-amber-500/20",
      lightBg: "bg-amber-50",
      change: "Action needed",
    },
    {
      label: "Approved This Month",
      value: data?.approvedLeavesThisMonth || 0,
      icon: CalendarCheck,
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "shadow-violet-500/20",
      lightBg: "bg-violet-50",
      change: "This month",
    },
  ];

  const deptColors = [
    "from-blue-400 to-blue-500",
    "from-emerald-400 to-emerald-500",
    "from-violet-400 to-violet-500",
    "from-amber-400 to-amber-500",
    "from-rose-400 to-rose-500",
    "from-cyan-400 to-cyan-500",
    "from-indigo-400 to-indigo-500",
  ];

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.2),transparent_50%)]" />
        <div className="relative z-10">
          <motion.p
            className="text-blue-200 text-sm font-medium"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {greeting}, Admin
          </motion.p>
          <motion.h1
            className="text-3xl font-bold mt-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            HR Dashboard
          </motion.h1>
          <motion.p
            className="text-blue-200/80 mt-2 text-sm max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Here&apos;s what&apos;s happening with your team today. Manage employees, track leaves, and monitor department performance.
          </motion.p>
        </div>
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/5 border border-white/10"
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-4 right-32 w-12 h-12 rounded-lg bg-white/5 border border-white/10"
          animate={{ y: [0, 6, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative bg-white rounded-2xl p-6 border border-slate-100 shadow-lg ${stat.bgGlow} hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group`}
          >
            {/* Background decoration */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-r ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg ${stat.bgGlow}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Departments</h3>
            </div>
          </div>
          <div className="space-y-4">
            {data?.departmentWise && data.departmentWise.length > 0 ? (
              data.departmentWise.map((dept, i) => (
                <motion.div
                  key={dept.department}
                  className="group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${deptColors[i % deptColors.length]}`} />
                      <span className="text-sm font-medium text-slate-700">
                        {dept.department}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{dept.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${deptColors[i % deptColors.length]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(dept.count / (data.totalEmployees || 1)) * 100}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Briefcase className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">No department data yet</p>
                <p className="text-xs mt-1">Add employees to see distribution</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Leave Applications */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Recent Leave Requests</h3>
                <p className="text-xs text-slate-500">Latest applications from your team</p>
              </div>
            </div>
            <Link
              href="/hr/leaves"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {data?.recentLeaves && data.recentLeaves.length > 0 ? (
              <div className="space-y-3">
                {data.recentLeaves.map((leave, i) => (
                  <motion.div
                    key={leave.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-all group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {leave.employee_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {leave.employee_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {leave.emp_id} &middot; {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {" - "}
                          {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                        leave.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : leave.status === "rejected"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <CalendarCheck className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">No leave applications yet</p>
                <p className="text-xs mt-1">Leave requests will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/hr/employees" className="group">
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-1">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <Users className="w-8 h-8 mb-3" />
            <h4 className="font-semibold text-lg">Manage Employees</h4>
            <p className="text-blue-100 text-sm mt-1">Add, edit, or view employee profiles</p>
            <ArrowUpRight className="w-5 h-5 absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        <Link href="/hr/leaves" className="group">
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:-translate-y-1">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <Clock className="w-8 h-8 mb-3" />
            <h4 className="font-semibold text-lg">Leave Requests</h4>
            <p className="text-amber-100 text-sm mt-1">Review and approve pending leaves</p>
            <ArrowUpRight className="w-5 h-5 absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
        <div className="group cursor-pointer" onClick={() => fetch("/api/leaves/reset", { method: "POST" }).then(() => fetchDashboard())}>
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:-translate-y-1">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <TrendingUp className="w-8 h-8 mb-3" />
            <h4 className="font-semibold text-lg">Reset Balances</h4>
            <p className="text-emerald-100 text-sm mt-1">Monthly CL balance reset for all</p>
            <ArrowUpRight className="w-5 h-5 absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
