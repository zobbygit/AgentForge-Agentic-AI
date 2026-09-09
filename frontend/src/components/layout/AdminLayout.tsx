import { Outlet, NavLink, useNavigate } from 'react-router-dom';

import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import {
  LayoutDashboard,
  Users,
  Zap,
  Cpu,
  FileText,
  ArrowLeft,
  Shield,
  Menu,
  X,
} from 'lucide-react';

const adminNav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/tasks', icon: Zap, label: 'Tasks' },
  { path: '/admin/models', icon: Cpu, label: 'AI Models' },
  { path: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full w-full">

      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-indigo-400" />

          <span className="font-display font-bold text-white">
            Admin Panel
          </span>
        </div>

        {/* Mobile close button */}
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {adminNav.map(({ path, icon: Icon, label, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Back to App */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <button
          onClick={() => handleNavigation('/dashboard')}
          className="sidebar-link w-full"
        >
          <ArrowLeft size={17} />
          <span>Back to App</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050A18] overflow-hidden">

      {/* =====================================================
          DESKTOP ADMIN SIDEBAR
      ====================================================== */}
      <aside className="hidden md:flex w-56 flex-col bg-[#080d1e] border-r border-white/[0.06] flex-shrink-0">
        <Sidebar />
      </aside>

      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />

            {/* Sliding sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#080d1e] border-r border-white/[0.06] z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* =====================================================
            MOBILE TOPBAR
        ====================================================== */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#080d1e] border-b border-white/[0.06]">

          {/* Admin branding */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>

            <span className="font-display font-bold text-white">
              Admin Panel
            </span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Open admin menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}