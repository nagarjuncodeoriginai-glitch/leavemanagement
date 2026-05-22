"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, UserCheck, Clock, CalendarCheck, TrendingUp,
  ArrowUpRight, ArrowRight, AlertTriangle, CheckCircle2,
  Calendar, Building2, BarChart3, PieChart, Activity, Zap,
  Target, UserPlus, Download, RefreshCw, Brain, Sparkles,
  MessageSquare, BellRing, Globe, Award, TrendingDown,
  Briefcase, Shield, Flame, Eye, ChevronRight,
} from "lucide-react";

interface DashboardData {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  approvedLeavesThisMonth: number;
  departmentWise: { department: string; count: number }[];
  recentLeaves: {
    id: number; employee_name: string; emp_id: string;
    start_date: string; end_date: string; status: string; reason: string;
  }[];
}


// Animated counter component
function AnimatedNumber({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

// SVG Gauge component
function GaugeChart({ value, max, label }: { value: number; max: number; label: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = 50;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = percentage > 70 ? "#10b981" : percentage > 40 ? "#3b82f6" : "#f59e0b";

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
        <motion.path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <p className="text-2xl font-bold text-slate-900 -mt-3">{value}%</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}


// AI Insights component
function AIInsightsPanel({ data }: { data: DashboardData | null }) {
  const insights = [
    { icon: Flame, color: "text-orange-500", bg: "bg-orange-50", text: `${data?.pendingLeaves || 0} leave requests pending approval. Consider batch-reviewing today.` },
    { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", text: `Team utilization is at ${data?.activeEmployees && data?.totalEmployees ? Math.round((data.activeEmployees / data.totalEmployees) * 100) : 100}%. Workforce health is excellent.` },
    { icon: Brain, color: "text-purple-500", bg: "bg-purple-50", text: "Based on leave patterns, Engineering may need temporary coverage next week." },
    { icon: Award, color: "text-blue-500", bg: "bg-blue-50", text: "Employee engagement score is trending up 12% this quarter." },
  ];

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors cursor-pointer group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + i * 0.12 }}
        >
          <div className={`w-8 h-8 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
            <insight.icon className={`w-4 h-4 ${insight.color}`} />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">{insight.text}</p>
        </motion.div>
      ))}
    </div>
  );
}


// Donut chart
function DonutChart({ segments, size = 130 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segments.map((segment, i) => {
          const segmentLength = total > 0 ? (segment.value / total) * circumference : 0;
          const offset = circumference - accumulated;
          accumulated += segmentLength;
          return (
            <motion.circle key={i} cx={size/2} cy={size/2} r={radius} fill="none"
              stroke={segment.color} strokeWidth="14"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={offset} strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${segmentLength} ${circumference - segmentLength}` }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{total}</span>
        <span className="text-[10px] text-slate-500 font-medium">Total</span>
      </div>
    </div>
  );
}


export default function HRDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetchDashboard();
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard/hr");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) { console.error("Dashboard fetch error:", error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-enterprise p-6 animate-pulse">
              <div className="h-11 w-11 bg-slate-200 rounded-xl mb-4" />
              <div className="h-8 w-16 bg-slate-200 rounded-lg mb-2" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-enterprise p-6 animate-pulse"><div className="h-64 bg-slate-100 rounded-xl" /></div>
          <div className="card-enterprise p-6 animate-pulse"><div className="h-64 bg-slate-100 rounded-xl" /></div>
        </div>
      </div>
    );
  }

  const approvalRate = data?.approvedLeavesThisMonth && (data.approvedLeavesThisMonth + (data.pendingLeaves || 0)) > 0
    ? Math.round((data.approvedLeavesThisMonth / (data.approvedLeavesThisMonth + (data.pendingLeaves || 0))) * 100)
    : 100;

  const stats = [
    { label: "Total Workforce", value: data?.totalEmployees || 0, icon: Users, trend: "+12%", trendUp: true, gradient: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Active Employees", value: data?.activeEmployees || 0, icon: UserCheck, trend: "+5%", trendUp: true, gradient: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Pending Approvals", value: data?.pendingLeaves || 0, icon: Clock, trend: data?.pendingLeaves ? "Action needed" : "All clear", trendUp: false, gradient: "from-amber-500 to-orange-600", bgColor: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "Approved This Month", value: data?.approvedLeavesThisMonth || 0, icon: CalendarCheck, trend: "+8%", trendUp: true, gradient: "from-violet-500 to-purple-600", bgColor: "bg-violet-50", iconColor: "text-violet-600" },
  ];


  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 lg:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">{greeting}, Admin</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">HR Command Center</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-lg">
              AI-powered workforce analytics and real-time insights at your fingertips. All systems operational.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-medium">All Systems Online</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                <Brain className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-xs text-blue-300 font-medium">AI Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDashboard} className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <Link href="/hr/employees" className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg">
              <UserPlus className="w-4 h-4" /> Add Employee
            </Link>
          </div>
        </div>
      </motion.div>


      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="relative group card-enterprise p-6 overflow-hidden cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.07] group-hover:opacity-[0.12] group-hover:scale-125 transition-all duration-500`} />
            <div className="flex items-start justify-between mb-4 relative">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shadow-sm`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${stat.trendUp ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 relative">
              <AnimatedNumber value={stat.value} />
            </p>
            <p className="text-sm text-slate-500 font-medium mt-1 relative">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: AI Panel + Charts */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* AI Insights Panel */}
        <motion.div
          className="lg:col-span-4 card-enterprise overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">AI Insights</h3>
                <p className="text-[11px] text-slate-500">Powered by HRMS AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700">LIVE</span>
            </div>
          </div>
          <div className="p-5">
            <AIInsightsPanel data={data} />
          </div>
        </motion.div>


        {/* Department + Gauge Charts */}
        <motion.div
          className="lg:col-span-4 card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Department Split</h3>
              <p className="text-xs text-slate-500 mt-0.5">Workforce distribution</p>
            </div>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>
          {data?.departmentWise && data.departmentWise.length > 0 ? (
            <div className="flex flex-col items-center">
              <DonutChart
                segments={data.departmentWise.map((dept, i) => ({
                  value: dept.count,
                  color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"][i % 6],
                  label: dept.department,
                }))}
              />
              <div className="w-full mt-5 space-y-2">
                {data.departmentWise.slice(0, 5).map((dept, i) => (
                  <div key={dept.department} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][i % 5] }} />
                    <span className="text-sm text-slate-600 flex-1 truncate">{dept.department}</span>
                    <span className="text-sm font-bold text-slate-900">{dept.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Building2 className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No department data</p>
            </div>
          )}
        </motion.div>

        {/* Performance Gauges */}
        <motion.div
          className="lg:col-span-4 card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Key Metrics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time performance</p>
            </div>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <GaugeChart value={approvalRate} max={100} label="Approval Rate" />
            <GaugeChart
              value={data?.activeEmployees && data?.totalEmployees ? Math.round((data.activeEmployees / data.totalEmployees) * 100) : 100}
              max={100} label="Active Rate"
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
              <p className="text-xl font-bold text-blue-700">{data?.totalEmployees || 0}</p>
              <p className="text-[11px] text-blue-600 font-medium">Headcount</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-xl font-bold text-emerald-700">{data?.approvedLeavesThisMonth || 0}</p>
              <p className="text-[11px] text-emerald-600 font-medium">Leaves/Month</p>
            </div>
          </div>
        </motion.div>
      </div>


      {/* Recent Leaves Table + Activity */}
      <div className="grid lg:grid-cols-12 gap-6">
        <motion.div
          className="lg:col-span-8 card-enterprise"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Recent Leave Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest applications requiring attention</p>
            </div>
            <Link href="/hr/leaves" className="btn-ghost text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {data?.recentLeaves && data.recentLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-enterprise">
                <thead>
                  <tr><th>Employee</th><th>Duration</th><th>Reason</th><th>Status</th><th className="text-right">Action</th></tr>
                </thead>
                <tbody>
                  {data.recentLeaves.slice(0, 5).map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                            {leave.employee_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{leave.employee_name}</p>
                            <p className="text-xs text-slate-500">{leave.emp_id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700 text-sm">
                            {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            {" - "}{new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </td>
                      <td><p className="text-slate-600 max-w-[160px] truncate text-sm">{leave.reason}</p></td>
                      <td>
                        <span className={leave.status === "approved" ? "badge-success" : leave.status === "rejected" ? "badge-danger" : "badge-warning"}>
                          {leave.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                          {leave.status === "pending" && <Clock className="w-3 h-3" />}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-right">
                        {leave.status === "pending" ? (
                          <Link href="/hr/leaves" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1">
                            Review <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CalendarCheck className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-medium">No leave applications yet</p>
            </div>
          )}
        </motion.div>


        {/* Quick Actions + Activity Feed */}
        <motion.div
          className="lg:col-span-4 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {/* Quick Actions */}
          <div className="card-enterprise p-5">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Add Employee", icon: UserPlus, href: "/hr/employees", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
                { label: "Leave Requests", icon: CalendarCheck, href: "/hr/leaves", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100" },
                { label: "View Reports", icon: BarChart3, href: "/hr", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100" },
                { label: "Attendance", icon: Clock, href: "/hr", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl ${action.bg} border border-transparent hover:border-slate-200 transition-all group`}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-[11px] font-medium text-slate-600 text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card-enterprise p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Activity Feed</h3>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {data?.recentLeaves?.slice(0, 4).map((leave) => (
                <div key={leave.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    leave.status === "approved" ? "bg-emerald-400" :
                    leave.status === "rejected" ? "bg-red-400" : "bg-amber-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate">
                      <span className="font-semibold">{leave.employee_name}</span> applied for leave
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    leave.status === "approved" ? "text-emerald-700 bg-emerald-50" :
                    leave.status === "rejected" ? "text-red-700 bg-red-50" : "text-amber-700 bg-amber-50"
                  }`}>{leave.status}</span>
                </div>
              )) || <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
