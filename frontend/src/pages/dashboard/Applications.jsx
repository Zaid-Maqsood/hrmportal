import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { formatDate } from '../../utils/date';
import { getApplications, updateApplicationStatus } from '../../api/applications.api';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';

const STATUSES = ['', 'APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    getApplications(params).then((r) => setApps(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    await updateApplicationStatus(id, status);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const filtered = apps.filter((a) =>
    a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    a.candidateEmail.toLowerCase().includes(search.toLowerCase()) ||
    a.job?.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Applications" subtitle="Review and manage candidate applications" />

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search candidates..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 text-[#1E3A8A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] transition-colors duration-200" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-[#1E3A8A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] cursor-pointer transition-colors duration-200">
            <option value="">All Statuses</option>
            {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-4"><TableSkeleton rows={6} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No applications found" description="Applications will appear here once candidates apply." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Candidate</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Job</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Applied</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium text-[#1E3A8A]">{app.candidateName}</td>
                    <td className="px-4 py-3 text-slate-600">{app.candidateEmail}</td>
                    <td className="px-4 py-3 text-slate-600">{app.job?.title}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(app.appliedAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E40AF] cursor-pointer transition-colors duration-200"
                      >
                        {STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                        className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-slate-400 hover:text-[#1E40AF] transition-colors duration-200 cursor-pointer"
                        aria-label="View details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
