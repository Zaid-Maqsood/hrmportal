export default function Card({ children, className = '', ...props }) {
  return (
    <div
      {...props}
      className={`bg-white border border-slate-200 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}
