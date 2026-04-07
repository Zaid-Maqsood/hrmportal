import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import { Briefcase, Users, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getDashboardStats } from '../../api/dashboard.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';

const PIE_COLORS = { APPLIED: '#3B82F6', SHORTLISTED: '#EAB308', INTERVIEW: '#8B5CF6', REJECTED: '#EF4444', HIRED: '#22C55E' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const pieData = data?.applicationsByStatus?.map((s) => ({
    name: s.status,
    value: s._count.status,
  })) || [];

  const barData = data?.applicationsByJob?.map((j) => ({
    name: j.title.length > 20 ? j.title.slice(0, 20) + '…' : j.title,
    applications: j._count.applications,
  })) || [];

  return (
    <div>
      <PageHeader
        title="HR Dashboard"
        subtitle="Overview of your recruitment pipeline"
        actions={
          <Link to="/dashboard/jobs">
            <Button size="sm">
              <Plus size={16} />
              New Job
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Open Jobs" value={data?.stats.openJobs} icon={Briefcase} color="#1E40AF" bgColor="#EFF6FF" />
          <StatCard title="Total Applications" value={data?.stats.totalApplications} icon={TrendingUp} color="#8B5CF6" bgColor="#F5F3FF" />
          <StatCard title="Total Hires" value={data?.stats.totalHires} icon={CheckCircle} color="#22C55E" bgColor="#F0FDF4" />
          <StatCard title="Employees" value={data?.stats.totalEmployees} icon={Users} color="#F59E0B" bgColor="#FFFBEB" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-base font-semibold text-[#1E3A8A] mb-4">Applications by Status</h3>
          {loading ? (
            <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[#1E3A8A] mb-4">Applications per Job</h3>
          {loading ? (
            <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#1E3A8A]">Recent Applications</h3>
          <Link to="/dashboard/applications" className="text-sm text-[#1E40AF] hover:underline cursor-pointer">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 font-medium text-slate-500">Candidate</th>
                  <th className="text-left py-2 font-medium text-slate-500">Job</th>
                  <th className="text-left py-2 font-medium text-slate-500">Status</th>
                  <th className="text-left py-2 font-medium text-slate-500">Applied</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentApplications?.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-3 font-medium text-[#1E3A8A]">{app.candidateName}</td>
                    <td className="py-3 text-slate-600">{app.job?.title}</td>
                    <td className="py-3"><Badge status={app.status} /></td>
                    <td className="py-3 text-slate-500">{formatDate(app.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
