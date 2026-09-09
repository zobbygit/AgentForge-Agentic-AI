import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Zap, FolderKanban, Brain, Archive, Calendar, Cpu, Code2, Bell, LogOut, Menu, X, ChevronRight, Shield, User, Settings, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: Zap, label: 'Tasks' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/teams', icon: Users, label: 'Teams' },
  { path: '/memory', icon: Brain, label: 'Memory' },
  { path: '/artifacts', icon: Archive, label: 'Artifacts' },
  { path: '/schedules', icon: Calendar, label: 'Schedules' },
  { path: '/models', icon: Cpu, label: 'AI Models' },
  { path: '/workspace', icon: Code2, label: 'Workspace' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const { data } = await api.get(
        '/notifications?unreadOnly=true&limit=1'
      );

      return data.data.unreadCount as number;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    socket.on(
      'task.completed',
      ({ taskId }: { taskId: string }) => {
        toast.success('Task completed!', { icon: '✅' });
        refetchNotifs();
      }
    );

    socket.on('task.failed', () => {
      toast.error('Task failed');
      refetchNotifs();
    });

    socket.on('approval.required', () => {
      toast('Approval required for task', { icon: '⚠️' });
      refetchNotifs();
    });

    return () => {
      socket.off('task.completed');
      socket.off('task.failed');
      socket.off('approval.required');
    };
  }, [refetchNotifs]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full ${
        mobile ? 'w-full' : ''
      }`}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap size={16} className="text-white" />
          </div>

          {(sidebarOpen || mobile) && (
            <span className="font-display font-bold text-lg text-white">
              AgentForge
            </span>
          )}
        </div>

        {!mobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <ChevronRight
              size={16}
              className={`transition-transform ${
                sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}

        {/* Mobile close button */}
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${
                !sidebarOpen && !mobile
                  ? 'justify-center px-2'
                  : ''
              }`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} />

            {(sidebarOpen || mobile) && (
              <span>{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/[0.06] pt-3">
        {/* Notifications */}


        
        <NavLink
  to="/notifications"
  onClick={() => setMobileOpen(false)}
  className={({ isActive }) =>
    `sidebar-link ${isActive ? 'active' : ''} ${!sidebarOpen && !mobile ? 'justify-center px-2' : ''}`
  }
  title={!sidebarOpen ? 'Notifications' : undefined}
>
  <Bell size={18} />
  {(sidebarOpen || mobile) && <span>Notifications</span>}
  {(notifData ?? 0) > 0 && (
    <span className={`bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ${sidebarOpen || mobile ? 'ml-auto' : ''}`}>
      {notifData}
    </span>
  )}
</NavLink>






        {/* Admin link */}
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${
                !sidebarOpen && !mobile
                  ? 'justify-center px-2'
                  : ''
              }`
            }
          >
            <Shield size={18} />

            {(sidebarOpen || mobile) && (
              <span>Admin Panel</span>
            )}
          </NavLink>
        )}

        {/* User */}
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mt-2 ${
            !sidebarOpen && !mobile
              ? 'justify-center'
              : ''
          }`}
        >
          <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-indigo-400" />
          </div>

          {(sidebarOpen || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          )}

          {(sidebarOpen || mobile) && (
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050A18] overflow-hidden">

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <motion.aside
        animate={{
          width: sidebarOpen ? 240 : 64,
        }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-[#080d1e] border-r border-white/[0.06] flex-shrink-0 overflow-hidden"
      >
        <Sidebar />
      </motion.aside>

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />

            {/* Mobile sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                type: 'spring',
                damping: 25,
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
            MOBILE TOPBAR + HAMBURGER
        ====================================================== */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#080d1e] border-b border-white/[0.06]">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>

            <span className="font-display font-bold text-white">
              AgentForge
            </span>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* =====================================================
            PAGE CONTENT
        ====================================================== */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}