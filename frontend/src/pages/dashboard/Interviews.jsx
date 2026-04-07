import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { formatDateTime } from '../../utils/date';
import { getInterviews, createInterview, updateInterview, deleteInterview } from '../../api/interviews.api';
import { getApplications } from '../../api/applications.api';
import { getEmployees } from '../../api/employees.api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';

const EMPTY = { applicationId: '', scheduledAt: '', interviewerId: '', notes: '', feedback: '' };

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      getInterviews(),
      getApplications({ status: 'SHORTLISTED' }),
      getEmployees(),
    ]).then(([i, a, e]) => {
      const scheduledAppIds = new Set(i.data.map((iv) => iv.applicationId));
      setInterviews(i.data);
      // Exclude applications that already have an interview scheduled
      setApplications(a.data.filter((app) => !scheduledAppIds.has(app.id)));
      setEmployees(e.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); };
  const openEdit = (iv) => {
    setSelected(iv);
    // Convert UTC to local time for the datetime-local input
    const d = new Date(iv.scheduledAt);
    const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({
      applicationId: iv.applicationId,
      scheduledAt: localISO,
      interviewerId: iv.interviewerId,
      notes: iv.notes || '',
      feedback: iv.feedback || '',
    });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert datetime-local (local time) to UTC ISO string before sending
      const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
      if (modal === 'create') await createInterview(payload);
      else await updateInterview(selected.id, payload);
      load(); closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteInterview(selected.id); load(); closeModal(); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Interviews" subtitle="Schedule and manage candidate interviews"
        actions={<Button size="sm" onClick={openCreate}><Plus size={16} /> Schedule Interview</Button>} />

      <div className="bg-white border border-slate-200 rounded-xl">
        {loading ? (
          <div className="p-4"><TableSkeleton rows={4} cols={5} /></div>
        ) : interviews.length === 0 ? (
          <EmptyState title="No interviews scheduled" description="Schedule an interview for a shortlisted candidate."
            action={<Button size="sm" onClick={openCreate}><Plus size={16} /> Schedule</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Candidate</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Job</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Scheduled</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Interviewer</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {interviews.map((iv) => (
                  <tr key={iv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium text-[#1E3A8A]">{iv.application?.candidateName}</td>
                    <td className="px-4 py-3 text-slate-600">{iv.application?.job?.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-[#1E40AF]" />
                        {formatDateTime(iv.scheduledAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{iv.interviewer?.name}</td>
                    <td className="px-4 py-3"><Badge status={iv.application?.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(iv)} className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-slate-400 hover:text-[#1E40AF] transition-colors duration-200 cursor-pointer"><Pencil size={14} /></button>
                        <button onClick={() => { setSelected(iv); setModal('delete'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal === 'create' || modal === 'edit'} onClose={closeModal}
        title={modal === 'create' ? 'Schedule Interview' : 'Edit Interview'} maxWidth="max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <Select label="Application" value={form.applicationId}
            onChange={(e) => setForm({ ...form, applicationId: e.target.value })} required>
            <option value="">Select candidate</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>{a.candidateName} — {a.job?.title}</option>
            ))}
          </Select>
          <Input label="Date & Time" type="datetime-local" value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
          <Select label="Interviewer" value={form.interviewerId}
            onChange={(e) => setForm({ ...form, interviewerId: e.target.value })} required>
            <option value="">Select interviewer</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
          <Textarea label="Notes" placeholder="Interview focus areas..." value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          {modal === 'edit' && (
            <Textarea label="Feedback" placeholder="Post-interview feedback..." value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })} rows={3} />
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{modal === 'create' ? 'Schedule' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'delete'} onClose={closeModal} title="Delete Interview">
        <p className="text-slate-600 mb-6">Are you sure you want to delete this interview?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
