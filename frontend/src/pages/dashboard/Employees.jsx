import { useEffect, useState } from 'react';
import { User, Mail, Phone, Building2, Briefcase, Pencil, Search } from 'lucide-react';
import { getEmployees, updateEmployee } from '../../api/employees.api';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getEmployees().then((r) => setEmployees(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openEdit = (emp) => {
    setSelected(emp);
    setForm({ name: emp.name, department: emp.employeeProfile?.department || '', position: emp.employeeProfile?.position || '', phone: emp.employeeProfile?.phone || '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateEmployee(selected.id, form); load(); setSelected(null); }
    finally { setSaving(false); }
  };

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.employeeProfile?.department?.toLowerCase().includes(q) ||
      emp.employeeProfile?.position?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader title="Employees" subtitle="View and manage your team members" />

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 text-[#1E3A8A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] transition-colors duration-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No employees found" description={search ? 'No employees match your search.' : 'Employees will appear here once they create accounts.'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <Card key={emp.id} className="relative hover:border-[#BFDBFE] transition-colors duration-200">
              <button onClick={() => openEdit(emp)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#EFF6FF] text-slate-400 hover:text-[#1E40AF] transition-colors duration-200 cursor-pointer"
                aria-label="Edit employee">
                <Pencil size={14} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-[#1E40AF]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E3A8A] text-sm">{emp.name}</p>
                  <Badge status="EMPLOYEE" />
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.employeeProfile?.department && (
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                    <span>{emp.employeeProfile.department}</span>
                  </div>
                )}
                {emp.employeeProfile?.position && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
                    <span>{emp.employeeProfile.position}</span>
                  </div>
                )}
                {emp.employeeProfile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                    <span>{emp.employeeProfile.phone}</span>
                  </div>
                )}
              </div>

              {emp.assignedTasks?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">{emp.assignedTasks.length} task{emp.assignedTasks.length !== 1 ? 's' : ''} assigned</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Edit Employee">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" />
          <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Frontend Developer" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setSelected(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
