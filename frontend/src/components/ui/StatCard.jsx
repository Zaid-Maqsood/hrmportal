import { motion } from 'motion/react';

export default function StatCard({ title, value, icon: Icon, color = '#1E40AF', bgColor = '#EFF6FF', delta }) {
  return (
    <motion.div
      whileHover={{ opacity: 0.9 }}
      transition={{ duration: 0.15 }}
      className="bg-white border border-slate-200 rounded-xl p-6 cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgColor }}>
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-[#1E3A8A]">{value ?? '—'}</div>
      {delta !== undefined && (
        <p className="text-xs text-slate-500 mt-1">{delta}</p>
      )}
    </motion.div>
  );
}
