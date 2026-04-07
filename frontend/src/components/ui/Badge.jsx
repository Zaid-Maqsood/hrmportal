const STATUS_STYLES = {
  // Application statuses
  APPLIED:     'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  INTERVIEW:   'bg-purple-100 text-purple-700',
  REJECTED:    'bg-red-100 text-red-700',
  HIRED:       'bg-green-100 text-green-700',
  // Task statuses
  TODO:        'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE:        'bg-green-100 text-green-700',
  // Job statuses
  OPEN:        'bg-green-100 text-green-700',
  CLOSED:      'bg-red-100 text-red-700',
  // Roles
  ADMIN:       'bg-purple-100 text-purple-700',
  EMPLOYEE:    'bg-blue-100 text-blue-700',
  CANDIDATE:   'bg-slate-100 text-slate-700',
  // Interview states
  SCHEDULED:   'bg-indigo-100 text-indigo-700',
  COMPLETED:   'bg-green-100 text-green-700',
};

const LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export default function Badge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  const label = LABELS[status] || status?.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}>
      {label}
    </span>
  );
}
