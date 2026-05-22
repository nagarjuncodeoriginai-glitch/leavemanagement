"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Building2, Calendar, Briefcase,
  CreditCard, Shield, Clock, Award, Globe, Hash, FileText,
} from "lucide-react";
import { Employee } from "@/types";

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);
      const res = await fetch(`/api/employees/${user.id}`);
      const json = await res.json();
      if (json.success) { setProfile(json.data); }
    } catch (error) { console.error("Profile fetch error:", error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card-enterprise p-8"><div className="flex items-center gap-4"><div className="skeleton w-20 h-20 rounded-2xl" /><div><div className="skeleton h-6 w-48 mb-2" /><div className="skeleton h-4 w-32" /></div></div></div>
        <div className="card-enterprise p-6 mt-6"><div className="skeleton h-40 w-full rounded-xl" /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card-enterprise p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <p className="font-semibold text-slate-600">Profile not found</p>
        <p className="text-sm text-slate-500 mt-1">Unable to load your profile information</p>
      </div>
    );
  }


  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "financial", label: "Financial", icon: CreditCard },
  ];

  const personalFields = [
    { label: "Full Name", value: profile.full_name, icon: User },
    { label: "Employee ID", value: profile.emp_id, icon: Hash },
    { label: "Email Address", value: profile.email, icon: Mail },
    { label: "Phone Number", value: profile.phone, icon: Phone },
    { label: "Gender", value: profile.gender, icon: User },
    { label: "Date of Birth", value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—", icon: Calendar },
    { label: "Address", value: profile.address || "—", icon: MapPin },
  ];

  const employmentFields = [
    { label: "Department", value: profile.department, icon: Building2 },
    { label: "Designation", value: profile.designation, icon: Award },
    { label: "Manager", value: profile.manager_name || "—", icon: User },
    { label: "Date of Joining", value: profile.doj ? new Date(profile.doj).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—", icon: Calendar },
    { label: "Employment Type", value: profile.employment_type, icon: FileText },
    { label: "Work Location", value: profile.work_location || "—", icon: Globe },
    { label: "Shift Timing", value: profile.shift_timing || "—", icon: Clock },
    { label: "Status", value: profile.status === "active" ? "Active" : profile.status === "on_probation" ? "On Probation" : "Inactive", icon: Shield },
  ];

  const financialFields = [
    { label: "Salary Package", value: profile.salary_package || "—", icon: CreditCard },
    { label: "Bank Account", value: profile.bank_account_number ? `••••••${profile.bank_account_number.slice(-4)}` : "—", icon: CreditCard },
    { label: "IFSC Code", value: profile.ifsc_code || "—", icon: Building2 },
    { label: "PAN Number", value: profile.pan_number ? `${profile.pan_number.slice(0, 3)}••••${profile.pan_number.slice(-2)}` : "—", icon: Shield },
    { label: "Aadhaar Number", value: profile.aadhaar_number ? `••••••${profile.aadhaar_number.slice(-4)}` : "—", icon: Shield },
  ];

  const currentFields = activeTab === "personal" ? personalFields : activeTab === "employment" ? employmentFields : financialFields;


  return (
    <div className="space-y-6 max-w-5xl">
      {/* Profile Header Card */}
      <motion.div className="card-enterprise-elevated overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
        </div>
        <div className="px-8 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-xl shadow-emerald-500/20">
              {profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{profile.full_name}</h2>
              <p className="text-slate-500 mt-0.5">{profile.designation} &middot; {profile.department}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge-info">{profile.emp_id}</span>
                <span className={profile.status === "active" ? "badge-success" : profile.status === "on_probation" ? "badge-warning" : "badge-danger"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile.status === "active" ? "bg-emerald-500" : profile.status === "on_probation" ? "bg-amber-500" : "bg-red-500"}`} />
                  {profile.status === "active" ? "Active" : profile.status === "on_probation" ? "On Probation" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs + Content */}
      <motion.div className="card-enterprise overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {/* Tab Navigation */}
        <div className="border-b border-slate-100 px-6">
          <div className="flex items-center gap-1 -mb-px">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentFields.map((field, i) => (
              <motion.div key={field.label} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <field.icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{field.label}</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{field.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
