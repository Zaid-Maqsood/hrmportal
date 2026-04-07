import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF6FF]">
        <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'EMPLOYEE') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
