import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle2, XCircle, Activity, Plus, ArrowRight, Clock, Brain, Bell } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  RUNNING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  PLANNING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  CANCELLED: 'bg-slate-600/10 text-slate-500 border-slate-600/20',
  APPROVAL_REQUIRED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/stats/dashboard');
      return data.data;
    },
    refetchInterval: 15000,
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications?limit=5');
      return data.data;
    },
  });

  const stats = statsData?.stats;
  const recentTasks = statsData?.recentTasks || [];
    const quota = statsData?.quota;
  const notifications = notifData?.notifications || [];

  const statCards = [
    { label: 'Active Tasks', value: stats?.active ?? '—', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Completed', value: stats?.completed ?? '—', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Failed', value: stats?.failed ?? '—', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Success Rate', value: stats ? `${stats.successRate}%` : '—', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
<div className="p-4 sm:p-6 max-w-6xl mx-auto w-full min-w-0">
      {/* Header */}
    <div className="flex items-start justify-between gap-4 mb-8 min-w-0">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Your agent workspace is ready</p>
        </div>
        <Link to="/tasks/new" className="forge-btn-primary inline-flex items-center gap-2 text-sm">
          <Plus size={16} /> New Task
        </Link>
      </div>
            {/* Quota bar */}
      {quota && (
        <div className="forge-card px-5 py-3.5 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Daily task quota</span>
              <span>{quota.used}/{quota.limit} used</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${quota.used >= quota.limit ? 'bg-red-500' : quota.used / quota.limit > 0.7 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
              />
            </div>
          </div>
          {quota.used >= quota.limit && (
            <span className="text-xs text-red-400 flex-shrink-0">Resets in {quota.resetsInHours}h</span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="forge-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <div className={`${bg} p-2 rounded-lg`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className={`font-display text-3xl font-bold ${color}`}>
              {isLoading ? <span className="animate-pulse">—</span> : value}
            </p>
          </motion.div>
        ))}
      </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0"> 
        {/* Recent Tasks */}
<div className="lg:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTasks.length === 0 && !isLoading && (
              <div className="forge-card p-8 text-center">
                <Zap size={28} className="text-indigo-400 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-4">No tasks yet. Run your first agent.</p>
                <Link to="/tasks/new" className="forge-btn-primary text-sm inline-flex items-center gap-2">
                  <Plus size={14} /> Create Task
                </Link>
              </div>
            )}
            {recentTasks.map((task: any) => (
              <Link key={task._id} to={`/tasks/${task._id}`}>
           <div className="forge-card-hover p-4 flex items-center gap-3 sm:gap-4 min-w-0 w-full">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.status === 'COMPLETED' ? 'bg-green-400' :
                    task.status === 'RUNNING' || task.status === 'PLANNING' ? 'bg-cyan-400 animate-pulse' :
                    task.status === 'FAILED' ? 'bg-red-400' : 'bg-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-slate-600" />
                      <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                 <span
  className={`status-badge border flex-shrink-0 max-w-[45%] truncate ${statusColors[task.status] || statusColors.PENDING}`}
>
                    {task.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifications sidebar */}
  <div className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <Bell size={15} className="text-slate-400" /> Notifications
            </h2>
            {notifData?.unreadCount > 0 && (
              <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifData.unreadCount}
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {notifications.length === 0 && (
              <div className="forge-card p-5 text-center">
                <Bell size={20} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No notifications yet</p>
              </div>
            )}
            {notifications.map((notif: any) => (
              <div key={notif._id} className={`forge-card p-4 ${!notif.isRead ? 'border-indigo-500/20' : ''}`}>
                <p className="text-xs font-medium text-slate-300">{notif.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                <p className="text-xs text-slate-600 mt-2">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-6">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'New Agent Task', href: '/tasks/new', icon: Zap },
                { label: 'View Memory', href: '/memory', icon: Brain },
                { label: 'View Artifacts', href: '/artifacts', icon: Activity },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} to={href}
                  className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-slate-200 py-2 px-3 rounded-lg hover:bg-white/5 transition-all">
                  <Icon size={15} className="text-indigo-400" /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}















// import { useQuery } from '@tanstack/react-query';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { Zap, CheckCircle2, XCircle, Activity, Plus, ArrowRight, Clock, Brain, Bell } from 'lucide-react';
// import api from '../../services/api';
// import { useAuthStore } from '../../stores/authStore';
// import { formatDistanceToNow } from 'date-fns';

// const statusColors: Record<string, string> = {
//   COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
//   RUNNING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
//   PLANNING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
//   FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
//   PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
//   CANCELLED: 'bg-slate-600/10 text-slate-500 border-slate-600/20',
//   APPROVAL_REQUIRED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
// };

// export default function DashboardPage() {
//   const { user } = useAuthStore();

//   const { data: statsData, isLoading } = useQuery({
//     queryKey: ['dashboard-stats'],
//     queryFn: async () => {
//       const { data } = await api.get('/tasks/stats/dashboard');
//       return data.data;
//     },
//     refetchInterval: 15000,
//   });

//   const { data: notifData } = useQuery({
//     queryKey: ['notifications'],
//     queryFn: async () => {
//       const { data } = await api.get('/notifications?limit=5');
//       return data.data;
//     },
//   });

//   const stats = statsData?.stats;
//   const recentTasks = statsData?.recentTasks || [];
//   const notifications = notifData?.notifications || [];

//   const statCards = [
//     { label: 'Active Tasks', value: stats?.active ?? '—', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
//     { label: 'Completed', value: stats?.completed ?? '—', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
//     { label: 'Failed', value: stats?.failed ?? '—', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
//     { label: 'Success Rate', value: stats ? `${stats.successRate}%` : '—', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
//   ];

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-8">
//         <div>
//           <h1 className="font-display text-2xl font-bold text-white">
//             Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
//           </h1>
//           <p className="text-slate-400 mt-1 text-sm">Your agent workspace is ready</p>
//         </div>
//         <Link to="/tasks/new" className="forge-btn-primary inline-flex items-center gap-2 text-sm">
//           <Plus size={16} /> New Task
//         </Link>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
//           <motion.div
//             key={label}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: i * 0.07 }}
//             className="forge-card p-5"
//           >
//             <div className="flex items-center justify-between mb-3">
//               <p className="text-xs text-slate-500 font-medium">{label}</p>
//               <div className={`${bg} p-2 rounded-lg`}>
//                 <Icon size={14} className={color} />
//               </div>
//             </div>
//             <p className={`font-display text-3xl font-bold ${color}`}>
//               {isLoading ? <span className="animate-pulse">—</span> : value}
//             </p>
//           </motion.div>
//         ))}
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* Recent Tasks */}
//         <div className="lg:col-span-2">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="font-display font-semibold text-white">Recent Tasks</h2>
//             <Link to="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
//               View all <ArrowRight size={12} />
//             </Link>
//           </div>
//           <div className="space-y-3">
//             {recentTasks.length === 0 && !isLoading && (
//               <div className="forge-card p-8 text-center">
//                 <Zap size={28} className="text-indigo-400 mx-auto mb-3" />
//                 <p className="text-slate-400 text-sm mb-4">No tasks yet. Run your first agent.</p>
//                 <Link to="/tasks/new" className="forge-btn-primary text-sm inline-flex items-center gap-2">
//                   <Plus size={14} /> Create Task
//                 </Link>
//               </div>
//             )}
//             {recentTasks.map((task: any) => (
//               <Link key={task._id} to={`/tasks/${task._id}`}>
//                 <div className="forge-card-hover p-4 flex items-center gap-4">
//                   <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
//                     task.status === 'COMPLETED' ? 'bg-green-400' :
//                     task.status === 'RUNNING' || task.status === 'PLANNING' ? 'bg-cyan-400 animate-pulse' :
//                     task.status === 'FAILED' ? 'bg-red-400' : 'bg-slate-500'
//                   }`} />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-slate-200 font-medium truncate">{task.title}</p>
//                     <div className="flex items-center gap-2 mt-0.5">
//                       <Clock size={11} className="text-slate-600" />
//                       <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
//                     </div>
//                   </div>
//                   <span className={`status-badge border ${statusColors[task.status] || statusColors.PENDING}`}>
//                     {task.status}
//                   </span>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* Notifications sidebar */}
//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="font-display font-semibold text-white flex items-center gap-2">
//               <Bell size={15} className="text-slate-400" /> Notifications
//             </h2>
//             {notifData?.unreadCount > 0 && (
//               <span className="bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                 {notifData.unreadCount}
//               </span>
//             )}
//           </div>
//           <div className="space-y-2.5">
//             {notifications.length === 0 && (
//               <div className="forge-card p-5 text-center">
//                 <Bell size={20} className="text-slate-600 mx-auto mb-2" />
//                 <p className="text-xs text-slate-500">No notifications yet</p>
//               </div>
//             )}
//             {notifications.map((notif: any) => (
//               <div key={notif._id} className={`forge-card p-4 ${!notif.isRead ? 'border-indigo-500/20' : ''}`}>
//                 <p className="text-xs font-medium text-slate-300">{notif.title}</p>
//                 <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
//                 <p className="text-xs text-slate-600 mt-2">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
//               </div>
//             ))}
//           </div>

//           {/* Quick actions */}
//           <div className="mt-6">
//             <h3 className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">Quick Actions</h3>
//             <div className="space-y-2">
//               {[
//                 { label: 'New Agent Task', href: '/tasks/new', icon: Zap },
//                 { label: 'View Memory', href: '/memory', icon: Brain },
//                 { label: 'View Artifacts', href: '/artifacts', icon: Activity },
//               ].map(({ label, href, icon: Icon }) => (
//                 <Link key={href} to={href}
//                   className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-slate-200 py-2 px-3 rounded-lg hover:bg-white/5 transition-all">
//                   <Icon size={15} className="text-indigo-400" /> {label}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







