"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Leaf,
  Clock,
  HelpCircle,
  Sparkles,
  Brain,
} from "lucide-react";


const navItems = [
  { href: "/employee", label: "Dashboard", icon: LayoutDashboard, description: "Overview & balance" },
  { href: "/employee/apply-leave", label: "Apply Leave", icon: CalendarPlus, description: "Submit request" },
  { href: "/employee/leaves", label: "Leave History", icon: CalendarCheck, description: "Track status" },
  { href: "/employee/ai-assistant", label: "AI Assistant", icon: Brain, description: "Ask anything" },
  { href: "/employee/profile", label: "My Profile", icon: User, description: "Personal info" },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<{ username: string; name?: string; emp_id?: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");
    if (role !== "employee") { router.push("/login"); return; }
    if (userData) { setUser(JSON.parse(userData)); }
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    router.push("/login");
  };

  if (!user) return null;

  const greeting = currentTime.getHours() < 12 ? "Good Morning" : currentTime.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : user.username.slice(0, 2).toUpperCase();


  return (
    <div className="min-h-screen bg-slate-50/50 gradient-mesh">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200/80 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${sidebarCollapsed ? "w-20" : "w-[280px]"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center px-4" : "px-6"} py-6 border-b border-slate-100`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div className="ml-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="font-bold text-slate-900 text-lg tracking-tight">LeaveHub</h1>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Employee Portal</p>
              </motion.div>
            )}
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden btn-icon">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? "px-2" : "px-4"} py-6 space-y-1.5`}>
            <p className={`text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 ${sidebarCollapsed ? "text-center" : "px-3"}`}>
              {sidebarCollapsed ? "Nav" : "Navigation"}
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`relative group ${sidebarCollapsed ? "justify-center px-3" : ""} ${
                    isActive
                      ? "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50"
                      : "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    isActive ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-slate-200"} transition-colors`}>
                    <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-emerald-600" : "text-slate-500 group-hover:text-slate-700"}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate">{item.label}</span>
                        <span className={`text-[11px] ${isActive ? "text-emerald-500" : "text-slate-400"}`}>{item.description}</span>
                      </div>
                      {isActive && <motion.div layoutId="activeNavEmp" className="absolute right-2 w-1.5 h-8 bg-emerald-500 rounded-full" />}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>


          {/* Quick Apply Card */}
          {!sidebarCollapsed && (
            <div className="px-4 pb-4">
              <Link href="/employee/apply-leave" className="block p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Quick Apply</p>
                    <p className="text-[11px] text-emerald-600">Submit leave request</p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* User Section */}
          <div className={`${sidebarCollapsed ? "px-2" : "px-4"} py-4 border-t border-slate-100`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-100 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name || user.username}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{user.emp_id || "Employee"}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
              </div>
            )}
            <button onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 ${sidebarCollapsed ? "justify-center px-3" : "px-4"} py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200`}
              title={sidebarCollapsed ? "Logout" : undefined}>
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-[280px]"}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60">
          <div className="flex items-center gap-4 px-4 sm:px-8 h-[72px]">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-icon">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex btn-icon">
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                {navItems.find((item) => item.href === pathname)?.label || "Employee Portal"}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">{greeting}, {user.name || user.username}</p>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn-icon relative">
                <Bell className="w-[18px] h-[18px]" />
              </button>
              <button className="btn-icon hidden sm:flex">
                <HelpCircle className="w-[18px] h-[18px]" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-emerald-500/20 ml-1">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
