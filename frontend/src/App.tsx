import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { connectSocket, disconnectSocket } from './services/socket';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import TasksPage from './pages/tasks/TasksPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import NewTaskPage from './pages/tasks/NewTaskPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import TeamsPage from './pages/teams/TeamsPage';
import MemoryPage from './pages/memory/MemoryPage';
import ArtifactsPage from './pages/artifacts/ArtifactsPage';
import SchedulesPage from './pages/schedules/SchedulesPage';
import ModelsPage from './pages/models/ModelsPage';
import WorkspacePage from './pages/workspaces/WorkspacePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminModels from './pages/admin/AdminModels';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import NotificationsPage from './pages/notifications/NotificationsPage';
import Footer from './pages/footer/Footer';
import SharedArtifactPage from './pages/shared/SharedArtifactPage';

// Route guards
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// const PublicRoute = ({ children }: { children: React.ReactNode }) => {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
// };

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <>{children}</>;

  return user?.role === 'ADMIN'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
};



export default function App() {
  const { isAuthenticated, accessToken, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchMe();
      connectSocket(accessToken);
    }
    return () => { if (!isAuthenticated) disconnectSocket(); };
  }, [isAuthenticated, accessToken]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
          <Route path="/share/:token" element={<SharedArtifactPage />} />
        <Route path='/'element={<Footer/>}></Route>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* App (authenticated) */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/new" element={<NewTaskPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
               <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="memory" element={<MemoryPage />} />
          <Route path="artifacts" element={<ArtifactsPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="models" element={<AdminModels />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
