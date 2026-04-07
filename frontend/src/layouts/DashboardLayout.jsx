import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, User } from 'lucide-react';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#EFF6FF] overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors duration-200 cursor-pointer text-slate-500" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full flex items-center justify-center">
                <User size={16} className="text-[#1E40AF]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[#1E3A8A] leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400 leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
