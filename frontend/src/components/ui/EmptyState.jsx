import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-4">
        <Inbox size={32} className="text-[#1E40AF]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1E3A8A] mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
