"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
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

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s your leave overview for {monthNames[(data?.leaveBalance?.month || 1) - 1]} {data?.leaveBalance?.year}
          </p>
        </div>
        <Link
          href="/employee/apply-leave"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg text-sm hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20"
        >
          <CalendarDays className="w-4 h-4" />
          Apply for Leave
        </Link>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-white rounded-xl border border-slate-200/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data?.leaveBalance?.total_cl || 2}</p>
          <p className="text-sm text-slate-500 mt-1">Total CL This Month</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-slate-200/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data?.leaveBalance?.remaining_cl ?? 2}</p>
          <p className="text-sm text-slate-500 mt-1">Remaining CL</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-slate-200/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data?.pendingLeaves || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Pending Requests</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-slate-200/50 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
            <CalendarDays className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{data?.leaveBalance?.used_cl || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Used CL This Month</p>
        </motion.div>
      </div>

      {/* Leave Balance Visual */}
      <motion.div
        className="bg-white rounded-xl border border-slate-200/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-semibold text-slate-900 mb-4">Monthly Leave Balance</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: `${((data?.leaveBalance?.remaining_cl ?? 2) / (data?.leaveBalance?.total_cl || 2)) * 100}%`,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-slate-700">
            {data?.leaveBalance?.remaining_cl ?? 2}/{data?.leaveBalance?.total_cl || 2} CL
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Note: Unused leaves will not carry forward to next month. Balance resets on the 1st of every month.
        </p>
      </motion.div>

      {/* Recent Leaves */}
      <motion.div
        className="bg-white rounded-xl border border-slate-200/50 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Recent Leave Applications</h3>
          <Link href="/employee/leaves" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All
          </Link>
        </div>
        {data?.recentLeaves && data.recentLeaves.length > 0 ? (
          <div className="space-y-3">
            {data.recentLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {leave.start_date !== leave.end_date && (
                      <> - {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{leave.reason}</p>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  leave.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                  leave.status === "rejected" ? "bg-red-50 text-red-700" :
                  "bg-amber-50 text-amber-700"
                }`}>
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No leave applications yet</p>
        )}
      </motion.div>
    </div>
  );
}
