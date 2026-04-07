import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Jobs from './pages/Jobs';
import Apply from './pages/Apply';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import JobsManagement from './pages/dashboard/JobsManagement';
import Applications from './pages/dashboard/Applications';
import ApplicationDetail from './pages/dashboard/ApplicationDetail';
import Interviews from './pages/dashboard/Interviews';
import Tasks from './pages/dashboard/Tasks';
import Employees from './pages/dashboard/Employees';

// Employee portal
import EmployeePortal from './pages/EmployeePortal';

// 404
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id/apply" element={<Apply />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Employee Portal */}
          <Route path="/portal" element={
            <ProtectedRoute roles={['EMPLOYEE']}>
              <EmployeePortal />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<JobsManagement />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="tasks" element={
              <ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}>
                <Tasks />
              </ProtectedRoute>
            } />
            <Route path="employees" element={<Employees />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/jobs" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
