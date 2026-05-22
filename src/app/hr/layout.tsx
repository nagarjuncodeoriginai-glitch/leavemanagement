"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Settings,
  Shield,
  TrendingUp,
  HelpCircle,
  Zap,
  Moon,
  Sun,
} from "lucide-react";

const navItems = [
  { href: "/hr", label: "Dashboard", icon: LayoutDashboard, description: "Overview & analytics" },
  { href: "/hr/employees", label: "Employees", icon: Users, description: "Manage workforce" },
  { href: "/hr/leaves", label: "Leave Management", icon: CalendarCheck, description: "Approve & track" },
];

const quickActions = [
  { label: "Add Employee", icon: Users, href: "/hr/employees" },
  { label: "Analytics", icon: TrendingUp, href: "/hr" },
];

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [notifications, setNotifications] = useState(3);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");
    if (role !== "hr") {
      router.push("/login");
      return;
    }
    if (userData) {
      setUser(JSON.parse(userData));
    }
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

  return (
    <div className="min-h-screen bg-slate-50/50 gradient-mesh">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200/80 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "w-20" : "w-[280px]"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center px-4" : "px-6"} py-6 border-b border-slate-100`}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div className="ml-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="font-bold text-slate-900 text-lg tracking-tight">HRMS Pro</h1>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Enterprise Suite</p>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden btn-icon"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? "px-2" : "px-4"} py-6 space-y-1.5`}>
            <p className={`text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 ${sidebarCollapsed ? "text-center" : "px-3"}`}>
              {sidebarCollapsed ? "Nav" : "Main Navigation"}
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative group ${isActive ? "sidebar-item-active" : "sidebar-item"} ${sidebarCollapsed ? "justify-center px-3" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200"} transition-colors`}>
                    <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"}`} />
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="block truncate">{item.label}</span>
                        <span className={`text-[11px] ${isActive ? "text-blue-500" : "text-slate-400"}`}>{item.description}</span>
                      </div>
                      {isActive && (
                        <motion.div layoutId="activeNav" className="absolute right-2 w-1.5 h-8 bg-blue-500 rounded-full" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}

            {/* Quick Actions */}
            {!sidebarCollapsed && (
              <div className="pt-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 px-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all text-center group"
                    >
                      <action.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Section */}
          <div className={`${sidebarCollapsed ? "px-2" : "px-4"} py-4 border-t border-slate-100`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-100 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                  HR
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.username}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">HR Administrator</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 ${sidebarCollapsed ? "justify-center px-3" : "px-4"} py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200`}
              title={sidebarCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-[280px]"}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60">
          <div className="flex items-center gap-4 px-4 sm:px-8 h-[72px]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn-icon"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Collapse toggle for desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex btn-icon"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title & Breadcrumb */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">
                {navItems.find((item) => item.href === pathname)?.label || "HR Portal"}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {greeting}, {user.username}
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-icon"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Notifications */}
              <button className="btn-icon relative">
                <Bell className="w-[18px] h-[18px]" />
                {notifications > 0 && (
                  <span className="notification-dot" />
                )}
              </button>

              {/* Settings */}
              <button className="btn-icon hidden sm:flex">
                <Settings className="w-[18px] h-[18px]" />
              </button>

              {/* User Avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20 ml-1">
                HR
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                className="px-4 sm:px-8 pb-4"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search employees, leaves, departments..."
                    className="input-enterprise pl-11"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
