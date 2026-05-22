"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  UserPlus,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";

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

// Mini bar chart component
function MiniBarChart({ data, maxValue }: { data: { label: string; value: number; color: string }[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className={`w-full rounded-t-md ${item.color} min-h-[4px]`}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
          <span className="text-[9px] text-slate-400 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart component
function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {segments.map((segment, i) => {
          const segmentLength = total > 0 ? (segment.value / total) * circumference : 0;
          const offset = circumference - accumulated;
          accumulated += segmentLength;
          return (
            <motion.circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="12"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
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

  useEffect(() => {
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-enterprise p-6">
              <div className="skeleton h-10 w-10 rounded-xl mb-4" />
              <div className="skeleton h-8 w-20 mb-2" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Workforce",
      value: data?.totalEmployees || 0,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      shadowColor: "shadow-blue-500/10",
    },
    {
      label: "Active Employees",
      value: data?.activeEmployees || 0,
      icon: UserCheck,
      trend: "+5%",
      trendUp: true,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      shadowColor: "shadow-emerald-500/10",
    },
    {
      label: "Pending Approvals",
      value: data?.pendingLeaves || 0,
      icon: Clock,
      trend: data?.pendingLeaves && data.pendingLeaves > 0 ? "Action needed" : "All clear",
      trendUp: false,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      shadowColor: "shadow-amber-500/10",
    },
    {
      label: "Approved This Month",
      value: data?.approvedLeavesThisMonth || 0,
      icon: CalendarCheck,
      trend: "+8%",
      trendUp: true,
      color: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      shadowColor: "shadow-violet-500/10",
    },
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weekData = weekDays.map((day) => ({
    label: day,
    value: Math.floor(Math.random() * 5) + 1,
    color: "bg-blue-400",
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">HR Analytics Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time workforce overview and leave management insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchDashboard} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <Link href="/hr/employees" className="btn-primary">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`card-enterprise p-6 relative overflow-hidden group cursor-pointer ${stat.shadowColor}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
          >
            {/* Background decoration */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trendUp ? "text-emerald-600" : "text-amber-600"}`}>
                {stat.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Department Distribution - Donut Chart */}
        <motion.div
          className="lg:col-span-4 card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Department Split</h3>
              <p className="text-xs text-slate-500 mt-0.5">Workforce distribution</p>
            </div>
            <div className="btn-icon">
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {data?.departmentWise && data.departmentWise.length > 0 ? (
            <div className="flex flex-col items-center">
              <DonutChart
                segments={data.departmentWise.map((dept, i) => ({
                  value: dept.count,
                  color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"][i % 7],
                  label: dept.department,
                }))}
              />
              <div className="w-full mt-6 space-y-2.5">
                {data.departmentWise.slice(0, 5).map((dept, i) => (
                  <div key={dept.department} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][i % 5] }}
                    />
                    <span className="text-sm text-slate-600 flex-1 truncate">{dept.department}</span>
                    <span className="text-sm font-semibold text-slate-900">{dept.count}</span>
                    <span className="text-xs text-slate-400">
                      {Math.round((dept.count / (data.totalEmployees || 1)) * 100)}%
                    </span>
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

        {/* Recent Leave Applications */}
        <motion.div
          className="lg:col-span-8 card-enterprise"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Recent Leave Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest applications requiring attention</p>
            </div>
            <Link href="/hr/leaves" className="btn-ghost text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {data?.recentLeaves && data.recentLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeaves.slice(0, 5).map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                            {leave.employee_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{leave.employee_name}</p>
                            <p className="text-xs text-slate-500">{leave.emp_id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700">
                            {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            {" - "}
                            {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <p className="text-slate-600 max-w-[180px] truncate">{leave.reason}</p>
                      </td>
                      <td>
                        <span className={`${
                          leave.status === "approved" ? "badge-success" :
                          leave.status === "rejected" ? "badge-danger" :
                          "badge-warning"
                        }`}>
                          {leave.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                          {leave.status === "pending" && <Clock className="w-3 h-3" />}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-right">
                        {leave.status === "pending" ? (
                          <Link href="/hr/leaves" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                            Review
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
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
              <p className="text-xs mt-1">Applications will appear here when employees apply</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Overview */}
        <motion.div
          className="card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">This Week</h3>
              <p className="text-xs text-slate-500 mt-0.5">Leave requests by day</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <MiniBarChart data={weekData} maxValue={6} />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Approval Rate</h3>
              <p className="text-xs text-slate-500 mt-0.5">This month&apos;s performance</p>
            </div>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold text-slate-900">
                {data?.approvedLeavesThisMonth && (data.approvedLeavesThisMonth + (data?.pendingLeaves || 0)) > 0
                  ? Math.round((data.approvedLeavesThisMonth / (data.approvedLeavesThisMonth + (data?.pendingLeaves || 0))) * 100)
                  : 100}%
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Above target
              </p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${data?.approvedLeavesThisMonth && (data.approvedLeavesThisMonth + (data?.pendingLeaves || 0)) > 0
                      ? (data.approvedLeavesThisMonth / (data.approvedLeavesThisMonth + (data?.pendingLeaves || 0))) * 100
                      : 100}%`,
                  }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="card-enterprise p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Activity Feed</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recent system events</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {data?.recentLeaves?.slice(0, 3).map((leave, i) => (
              <div key={leave.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  leave.status === "approved" ? "bg-emerald-400" :
                  leave.status === "rejected" ? "bg-red-400" : "bg-amber-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">
                    <span className="font-medium">{leave.employee_name}</span> applied for leave
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
