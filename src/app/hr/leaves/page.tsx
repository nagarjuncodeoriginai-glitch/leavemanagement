"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, CalendarDays, Filter,
  Search, Download, Eye, MessageSquare, ChevronLeft,
  ChevronRight, AlertTriangle, X, CheckCircle2, BarChart3,
  Users, Calendar, ArrowUpRight, Zap,
} from "lucide-react";
import { Leave } from "@/types";


export default function HRLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "10",
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/leaves?${params}`);
      const json = await res.json();
      if (json.success) { setLeaves(json.data); setTotal(json.total); }
    } catch (error) { console.error("Fetch leaves error:", error); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  // Calculate stats from data
  useEffect(() => {
    const pending = leaves.filter(l => l.status === "pending").length;
    const approved = leaves.filter(l => l.status === "approved").length;
    const rejected = leaves.filter(l => l.status === "rejected").length;
    setStats({ pending, approved, rejected });
  }, [leaves]);

  const handleAction = async (leaveId: number, action: "approved" | "rejected") => {
    setActionLoading(leaveId);
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) { fetchLeaves(); setSelectedLeave(null); }
    } catch (error) { console.error("Leave action error:", error); }
    finally { setActionLoading(null); }
  };

  const totalPages = Math.ceil(total / 10);
  const filteredLeaves = searchQuery
    ? leaves.filter(l => l.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) || l.emp_id?.toLowerCase().includes(searchQuery.toLowerCase()))
    : leaves;


  const filterTabs = [
    { value: "", label: "All Requests", icon: CalendarDays, count: total },
    { value: "pending", label: "Pending", icon: Clock, count: stats.pending },
    { value: "approved", label: "Approved", icon: CheckCircle, count: stats.approved },
    { value: "rejected", label: "Rejected", icon: XCircle, count: stats.rejected },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-1">Review, approve, and manage employee leave requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div className="card-enterprise p-5 flex items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            <p className="text-sm text-slate-500">Awaiting Review</p>
          </div>
          {stats.pending > 0 && (
            <div className="ml-auto">
              <span className="badge-warning"><Zap className="w-3 h-3" />Urgent</span>
            </div>
          )}
        </motion.div>
        <motion.div className="card-enterprise p-5 flex items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
            <p className="text-sm text-slate-500">Approved</p>
          </div>
        </motion.div>
        <motion.div className="card-enterprise p-5 flex items-center gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
            <p className="text-sm text-slate-500">Rejected</p>
          </div>
        </motion.div>
      </div>


      {/* Filter Tabs & Search */}
      <div className="card-enterprise p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.value
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                    statusFilter === tab.value ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
          <div className="relative lg:ml-auto lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by employee..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="input-enterprise pl-10 py-2.5" />
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="card-enterprise overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8" />
            </div>
            <p className="font-semibold text-slate-600">No leave requests found</p>
            <p className="text-sm mt-1">Requests will appear here when employees apply</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-enterprise">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave, i) => (
                  <motion.tr key={leave.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                          {leave.employee_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{leave.employee_name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">{leave.emp_id}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge-info">CL</span></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-700 text-sm">
                          {new Date(leave.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {" — "}
                          {new Date(leave.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </td>
                    <td><p className="text-slate-600 max-w-[200px] truncate text-sm">{leave.reason}</p></td>
                    <td>
                      <span className={leave.status === "approved" ? "badge-success" : leave.status === "rejected" ? "badge-danger" : "badge-warning"}>
                        <span className={`w-1.5 h-1.5 rounded-full ${leave.status === "approved" ? "bg-emerald-500" : leave.status === "rejected" ? "bg-red-500" : "bg-amber-500"}`} />
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-sm text-slate-500">{new Date(leave.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setSelectedLeave(leave)} className="btn-icon w-8 h-8" title="View Details"><Eye className="w-4 h-4" /></button>
                        {leave.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(leave.id, "approved")} disabled={actionLoading === leave.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all disabled:opacity-50">
                              <CheckCircle className="w-3.5 h-3.5" />Approve
                            </button>
                            <button onClick={() => handleAction(leave.id, "rejected")} disabled={actionLoading === leave.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 border border-red-100 transition-all disabled:opacity-50">
                              <XCircle className="w-3.5 h-3.5" />Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* Pagination */}
        {total > 10 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span> &middot; {total} total
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Detail Slide-over */}
      <AnimatePresence>
        {selectedLeave && (
          <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedLeave(null)} />
            <motion.div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-semibold text-slate-900">Leave Request Details</h3>
                <button onClick={() => setSelectedLeave(null)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                    {selectedLeave.employee_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{selectedLeave.employee_name || "Unknown"}</h4>
                    <p className="text-sm text-slate-500">{selectedLeave.emp_id}</p>
                  </div>
                </div>

                {/* Leave Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Leave Type</span><span className="badge-info">Casual Leave</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Status</span>
                    <span className={selectedLeave.status === "approved" ? "badge-success" : selectedLeave.status === "rejected" ? "badge-danger" : "badge-warning"}>
                      {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-500">From</span><span className="text-sm font-medium text-slate-900">{new Date(selectedLeave.start_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-500">To</span><span className="text-sm font-medium text-slate-900">{new Date(selectedLeave.end_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Applied</span><span className="text-sm text-slate-700">{new Date(selectedLeave.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                </div>

                {/* Reason */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedLeave.reason}</p>
                </div>

                {/* Actions */}
                {selectedLeave.status === "pending" && (
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => handleAction(selectedLeave.id, "approved")} disabled={actionLoading === selectedLeave.id} className="btn-success flex-1">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleAction(selectedLeave.id, "rejected")} disabled={actionLoading === selectedLeave.id} className="btn-danger flex-1">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
