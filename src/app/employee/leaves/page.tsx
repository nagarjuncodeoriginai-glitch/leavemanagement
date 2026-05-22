"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, Clock, CheckCircle, XCircle, Calendar,
  ChevronLeft, ChevronRight, Filter, Download, CalendarPlus,
} from "lucide-react";
import { Leave } from "@/types";
import Link from "next/link";

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", ...(statusFilter && { status: statusFilter }) });
      const res = await fetch(`/api/leaves?${params}`);
      const json = await res.json();
      if (json.success) { setLeaves(json.data); setTotal(json.total); }
    } catch (error) { console.error("Fetch leaves error:", error); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const totalPages = Math.ceil(total / 10);


  const filterTabs = [
    { value: "", label: "All", icon: CalendarDays },
    { value: "pending", label: "Pending", icon: Clock },
    { value: "approved", label: "Approved", icon: CheckCircle },
    { value: "rejected", label: "Rejected", icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave History</h2>
          <p className="text-sm text-slate-500 mt-1">Track all your leave applications and their status</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link href="/employee/apply-leave" className="btn-success">
            <CalendarPlus className="w-4 h-4" />
            Apply Leave
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card-enterprise p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>


      {/* Leaves List */}
      <div className="card-enterprise overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8" />
            </div>
            <p className="font-semibold text-slate-600">No leave applications found</p>
            <p className="text-sm mt-1">Apply for leave to see your history here</p>
            <Link href="/employee/apply-leave" className="btn-success mt-4">
              <CalendarPlus className="w-4 h-4" /> Apply Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {leaves.map((leave, i) => (
              <motion.div key={leave.id} className="px-6 py-5 hover:bg-slate-50/50 transition-colors"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    leave.status === "approved" ? "bg-emerald-50 border border-emerald-100" :
                    leave.status === "rejected" ? "bg-red-50 border border-red-100" :
                    "bg-amber-50 border border-amber-100"}`}>
                    {leave.status === "approved" ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                     leave.status === "rejected" ? <XCircle className="w-5 h-5 text-red-600" /> :
                     <Clock className="w-5 h-5 text-amber-600" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge-info">Casual Leave</span>
                      <span className="text-xs text-slate-400">&middot;</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        {leave.start_date !== leave.end_date && (
                          <> — {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{leave.reason}</p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Applied on {new Date(leave.applied_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span className={leave.status === "approved" ? "badge-success" : leave.status === "rejected" ? "badge-danger" : "badge-warning"}>
                      <span className={`w-1.5 h-1.5 rounded-full ${leave.status === "approved" ? "bg-emerald-500" : leave.status === "rejected" ? "bg-red-500" : "bg-amber-500"}`} />
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
