"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2, X, UserPlus, AlertCircle,
  Download, Upload, Filter, MoreVertical, Eye, Mail, Phone,
  Building2, MapPin, ChevronLeft, ChevronRight, Users,
  CheckSquare, Grid3X3, List, RefreshCw, SlidersHorizontal,
} from "lucide-react";
import { Employee, EmployeeFormData } from "@/types";


const defaultForm: EmployeeFormData = {
  emp_id: "", full_name: "", email: "", phone: "", gender: "Male",
  date_of_birth: "", address: "", department: "", designation: "",
  manager_name: "", doj: "", employment_type: "Full-Time",
  probation_period: "", confirmation_date: "", work_location: "",
  shift_timing: "", salary_package: "", bank_account_number: "",
  ifsc_code: "", pan_number: "", aadhaar_number: "",
  username: "", password: "", status: "active",
};

const departments = ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];
const statuses = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_probation", label: "On Probation" },
];


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(defaultForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [formStep, setFormStep] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "10",
        ...(search && { search }),
        ...(departmentFilter && { department: departmentFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/employees?${params}`);
      const json = await res.json();
      if (json.success) { setEmployees(json.data); setTotal(json.total); }
    } catch (error) { console.error("Fetch employees error:", error); }
    finally { setLoading(false); }
  }, [page, search, departmentFilter, statusFilter]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setSubmitting(true);
    try {
      const url = editId ? `/api/employees/${editId}` : "/api/employees";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.success) { setShowModal(false); setForm(defaultForm); setEditId(null); setFormStep(0); fetchEmployees(); }
      else { setFormError(json.message || "Operation failed"); }
    } catch { setFormError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (emp: Employee) => {
    setForm({ ...emp, password: "", date_of_birth: emp.date_of_birth?.split("T")[0] || "", doj: emp.doj?.split("T")[0] || "", confirmation_date: emp.confirmation_date?.split("T")[0] || "" });
    setEditId(emp.id); setFormStep(0); setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { fetchEmployees(); setSelectedEmployees(prev => prev.filter(e => e !== id)); }
    } catch (error) { console.error("Delete error:", error); }
  };

  const toggleSelect = (id: number) => {
    setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    setSelectedEmployees(prev => prev.length === employees.length ? [] : employees.map(e => e.id));
  };

  const totalPages = Math.ceil(total / 10);


  const formSteps = [
    { title: "Basic Information", description: "Personal details" },
    { title: "Job Details", description: "Employment information" },
    { title: "Compensation", description: "Salary & banking" },
    { title: "Account Setup", description: "Login credentials" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization&apos;s workforce &middot; <span className="font-semibold text-slate-700">{total}</span> employees
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => fetchEmployees()}>
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => { setForm(defaultForm); setEditId(null); setFormStep(0); setShowModal(true); }}
            className="btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>


      {/* Search & Filters Bar */}
      <div className="card-enterprise p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search by name, ID, email, department..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-enterprise pl-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }} className="select-enterprise w-auto min-w-[160px]">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select-enterprise w-auto min-w-[140px]">
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <div className="hidden lg:flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("table")} className={`p-2.5 ${viewMode === "table" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {selectedEmployees.length > 0 && (
          <div className="mt-3 flex items-center gap-3 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{selectedEmployees.length} selected</span>
            <button className="ml-auto text-xs font-medium text-red-600 hover:text-red-700" onClick={() => setSelectedEmployees([])}>Clear</button>
          </div>
        )}
      </div>


      {/* Table View */}
      {viewMode === "table" ? (
        <div className="card-enterprise overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <p className="font-semibold text-slate-600">No employees found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th className="w-12">
                      <input type="checkbox" checked={selectedEmployees.length === employees.length && employees.length > 0} onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, i) => (
                    <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className={selectedEmployees.includes(emp.id) ? "!bg-blue-50/50" : ""}>
                      <td>
                        <input type="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={() => toggleSelect(emp.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-sm font-bold border border-blue-200/50">
                            {emp.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{emp.full_name}</p>
                            <p className="text-xs text-slate-500">{emp.emp_id} &middot; {emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-info">{emp.department}</span>
                      </td>
                      <td><span className="text-slate-700">{emp.designation}</span></td>
                      <td>
                        <span className={emp.status === "active" ? "badge-success" : emp.status === "inactive" ? "badge-danger" : "badge-warning"}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "active" ? "bg-emerald-500" : emp.status === "inactive" ? "bg-red-500" : "bg-amber-500"}`} />
                          {emp.status === "on_probation" ? "Probation" : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                        </span>
                      </td>
                      <td className="text-slate-600">
                        {emp.doj ? new Date(emp.doj).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewEmployee(emp)} className="btn-icon w-8 h-8" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleEdit(emp)} className="btn-icon w-8 h-8" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(emp.id)} className="btn-icon w-8 h-8 hover:!bg-red-50 hover:!text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
                Showing <span className="font-semibold text-slate-700">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(page * 10, total)}</span> of <span className="font-semibold text-slate-700">{total}</span>
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="btn-icon w-9 h-9 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [...Array(8)].map((_, i) => <div key={i} className="card-enterprise p-6"><div className="skeleton h-12 w-12 rounded-xl mb-4" /><div className="skeleton h-4 w-3/4 mb-2" /><div className="skeleton h-3 w-1/2" /></div>)
          ) : employees.map((emp, i) => (
            <motion.div key={emp.id} className="card-enterprise p-5 group hover:shadow-lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-sm font-bold border border-blue-200/50">
                  {emp.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <span className={emp.status === "active" ? "badge-success" : emp.status === "inactive" ? "badge-danger" : "badge-warning"}>
                  {emp.status === "active" ? "Active" : emp.status === "inactive" ? "Inactive" : "Probation"}
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 truncate">{emp.full_name}</h4>
              <p className="text-sm text-slate-500 mt-0.5">{emp.designation}</p>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500"><Building2 className="w-3.5 h-3.5" />{emp.department}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500"><Mail className="w-3.5 h-3.5" /><span className="truncate">{emp.email}</span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setViewEmployee(emp)} className="btn-icon w-8 h-8"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleEdit(emp)} className="btn-icon w-8 h-8"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(emp.id)} className="btn-icon w-8 h-8 hover:!bg-red-50 hover:!text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}


      {/* View Employee Detail Slide-over */}
      <AnimatePresence>
        {viewEmployee && (
          <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setViewEmployee(null)} />
            <motion.div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-semibold text-slate-900">Employee Details</h3>
                <button onClick={() => setViewEmployee(null)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                    {viewEmployee.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{viewEmployee.full_name}</h4>
                    <p className="text-sm text-slate-500">{viewEmployee.designation} &middot; {viewEmployee.department}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{viewEmployee.emp_id}</p>
                  </div>
                </div>
                {[
                  { label: "Email", value: viewEmployee.email, icon: Mail },
                  { label: "Phone", value: viewEmployee.phone, icon: Phone },
                  { label: "Location", value: viewEmployee.work_location || "—", icon: MapPin },
                  { label: "Manager", value: viewEmployee.manager_name || "—", icon: Users },
                  { label: "Joined", value: viewEmployee.doj ? new Date(viewEmployee.doj).toLocaleDateString("en-IN") : "—", icon: Building2 },
                  { label: "Type", value: viewEmployee.employment_type, icon: Building2 },
                ].map(field => (
                  <div key={field.label} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                    <field.icon className="w-4 h-4 text-slate-400" />
                    <div><p className="text-[11px] text-slate-400 uppercase font-semibold">{field.label}</p><p className="text-sm text-slate-900">{field.value}</p></div>
                  </div>
                ))}
                <div className="pt-4 flex gap-3">
                  <button onClick={() => { handleEdit(viewEmployee); setViewEmployee(null); }} className="btn-primary flex-1">Edit Employee</button>
                  <button onClick={() => { handleDelete(viewEmployee.id); setViewEmployee(null); }} className="btn-danger flex-1">Delete</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Add/Edit Modal - Multi-Step */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{editId ? "Edit Employee" : "Add New Employee"}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Step {formStep + 1} of {formSteps.length}: {formSteps[formStep].title}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>

              {/* Step Indicator */}
              <div className="px-8 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {formSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i <= formStep ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-200 text-slate-500"}`}>{i + 1}</div>
                      {i < formSteps.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < formStep ? "bg-blue-500" : "bg-slate-200"}`} />}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[55vh]">
                {formError && (
                  <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700 font-medium">{formError}</span>
                  </div>
                )}


                {/* Step 0: Basic Info */}
                {formStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Employee ID *</label><input type="text" value={form.emp_id} onChange={(e) => setForm({ ...form, emp_id: e.target.value })} required className="input-enterprise" placeholder="EMP001" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label><input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="input-enterprise" placeholder="John Doe" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-enterprise" placeholder="john@company.com" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="input-enterprise" placeholder="+91 9876543210" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Gender *</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="select-enterprise"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label><input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="input-enterprise" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="input-enterprise resize-none" placeholder="Full address" /></div>
                  </div>
                )}

                {/* Step 1: Job Details */}
                {formStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Department *</label><select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required className="select-enterprise"><option value="">Select Department</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Designation *</label><input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required className="input-enterprise" placeholder="Software Engineer" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Manager</label><input type="text" value={form.manager_name} onChange={(e) => setForm({ ...form, manager_name: e.target.value })} className="input-enterprise" placeholder="Manager Name" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Joining *</label><input type="date" value={form.doj} onChange={(e) => setForm({ ...form, doj: e.target.value })} required className="input-enterprise" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Employment Type</label><select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="select-enterprise"><option value="Full-Time">Full-Time</option><option value="Part-Time">Part-Time</option><option value="Contract">Contract</option><option value="Intern">Intern</option></select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Work Location</label><input type="text" value={form.work_location} onChange={(e) => setForm({ ...form, work_location: e.target.value })} className="input-enterprise" placeholder="Office / Remote" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Shift Timing</label><input type="text" value={form.shift_timing} onChange={(e) => setForm({ ...form, shift_timing: e.target.value })} className="input-enterprise" placeholder="9 AM - 6 PM" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeFormData["status"] })} className="select-enterprise"><option value="active">Active</option><option value="inactive">Inactive</option><option value="on_probation">On Probation</option></select></div>
                  </div>
                )}


                {/* Step 2: Compensation */}
                {formStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Package</label><input type="text" value={form.salary_package} onChange={(e) => setForm({ ...form, salary_package: e.target.value })} className="input-enterprise" placeholder="8,00,000 PA" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Bank Account Number</label><input type="text" value={form.bank_account_number} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} className="input-enterprise" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">IFSC Code</label><input type="text" value={form.ifsc_code} onChange={(e) => setForm({ ...form, ifsc_code: e.target.value })} className="input-enterprise" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">PAN Number</label><input type="text" value={form.pan_number} onChange={(e) => setForm({ ...form, pan_number: e.target.value })} className="input-enterprise" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Aadhaar Number</label><input type="text" value={form.aadhaar_number} onChange={(e) => setForm({ ...form, aadhaar_number: e.target.value })} className="input-enterprise" /></div>
                  </div>
                )}

                {/* Step 3: Account */}
                {formStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Username *</label><input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="input-enterprise" placeholder="john.doe" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password {editId ? "(leave blank to keep)" : "*"}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editId} className="input-enterprise" placeholder="••••••••" /></div>
                  </div>
                )}

                {/* Form Navigation */}
                <div className="flex justify-between pt-8 mt-6 border-t border-slate-100">
                  <button type="button" onClick={() => formStep > 0 ? setFormStep(formStep - 1) : setShowModal(false)}
                    className="btn-secondary">{formStep > 0 ? "Previous" : "Cancel"}</button>
                  {formStep < formSteps.length - 1 ? (
                    <button type="button" onClick={() => setFormStep(formStep + 1)} className="btn-primary">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" disabled={submitting} className="btn-primary">
                      {submitting ? "Saving..." : editId ? "Update Employee" : "Create Employee"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
