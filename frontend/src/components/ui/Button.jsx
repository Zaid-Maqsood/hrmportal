const variants = {
  primary: 'bg-[#1E40AF] text-white hover:bg-[#1D4ED8] focus:ring-[#1E40AF]',
  secondary: 'bg-white text-[#1E40AF] border border-[#1E40AF] hover:bg-[#EFF6FF] focus:ring-[#1E40AF]',
  cta: 'bg-[#22C55E] text-white hover:bg-[#16A34A] focus:ring-[#22C55E]',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  ghost: 'bg-transparent text-[#1E40AF] hover:bg-[#EFF6FF] focus:ring-[#1E40AF]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children, variant = 'primary', size = 'md', disabled, loading, className = '', ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
