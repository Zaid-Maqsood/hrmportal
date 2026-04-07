export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-[#1E3A8A]">{label}</label>}
      <select
        {...props}
        className={`
          w-full px-3 py-2 rounded-lg border text-[#1E3A8A] bg-white text-sm
          focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent
          transition-colors duration-200 cursor-pointer
          ${error ? 'border-red-400' : 'border-slate-200'}
          ${className}
        `}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
