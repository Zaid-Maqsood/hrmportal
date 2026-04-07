import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <p className="text-8xl font-bold text-[#1E40AF] mb-4">404</p>
        <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">Page not found</h1>
        <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="px-6 py-3 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1D4ED8] transition-colors duration-200 text-sm font-medium cursor-pointer">
          Go home
        </Link>
      </motion.div>
    </div>
  );
}
