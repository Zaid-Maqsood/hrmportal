import { Link, Outlet } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#EFF6FF]">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-[#1E3A8A]">HRM Platform</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/jobs" className="text-sm font-medium text-slate-600 hover:text-[#1E40AF] transition-colors duration-200 cursor-pointer">
              Open Positions
            </Link>
            <Link to="/login" className="text-sm font-medium px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors duration-200 cursor-pointer">
              Login
            </Link>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-16 bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} HRM Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
