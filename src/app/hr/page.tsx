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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Employees",
      value: data?.totalEmployees || 0,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Employees",
      value: data?.activeEmployees || 0,
      icon: UserCheck,
      color: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Pending Leaves",
      value: data?.pendingLeaves || 0,
      icon: Clock,
      color: "amber",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Approved This Month",
      value: data?.approvedLeavesThisMonth || 0,
      icon: CalendarCheck,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200/50 p-6 hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <motion.div
          className="lg:col-span-1 bg-white rounded-xl border border-slate-200/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Departments</h3>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-4">
            {data?.departmentWise && data.departmentWise.length > 0 ? (
              data.departmentWise.map((dept, i) => (
                <div key={dept.department} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        {dept.department}
                      </span>
                      <span className="text-sm text-slate-500">{dept.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full transition-all"
                        style={{
                          width: `${(dept.count / (data.totalEmployees || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                No department data available
              </p>
            )}
          </div>
        </motion.div>

        {/* Recent Leave Applications */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Recent Leave Applications</h3>
            <a href="/hr/leaves" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </a>
          </div>
          <div className="overflow-x-auto">
            {data?.recentLeaves && data.recentLeaves.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">Employee</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">Dates</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {leave.employee_name}
                          </p>
                          <p className="text-xs text-slate-500">{leave.emp_id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <p className="text-sm text-slate-700">
                          {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {" - "}
                          {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            leave.status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : leave.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                No leave applications yet
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
