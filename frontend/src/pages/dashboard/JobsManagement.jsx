import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getJobs, createJob, updateJob, deleteJob } from '../../api/jobs.api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';

const EMPTY_FORM = { title: '', description: '', location: '', type: 'Full-time', status: 'OPEN' };

export default function JobsManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getJobs().then((r) => setJobs(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (job) => { setForm({ title: job.title, description: job.description, location: job.location, type: job.type, status: job.status }); setSelected(job); setModal('edit'); };
  const openDelete = (job) => { setSelected(job); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await createJob(form);
      else await updateJob(selected.id, form);
      load();
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteJob(selected.id); load(); closeModal(); }
    finally { setSaving(false); }
  };

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Job Postings"
        subtitle="Manage open and closed positions"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} /> New Job
          </Button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search jobs..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 text-[#1E3A8A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] transition-colors duration-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4"><TableSkeleton rows={5} cols={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No jobs found" description="Create your first job posting to get started."
            action={<Button size="sm" onClick={openCreate}><Plus size={16} /> Create Job</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Applications</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium text-[#1E3A8A]">{job.title}</td>
                    <td className="px-4 py-3 text-slate-600">{job.location}</td>
                    <td className="px-4 py-3 text-slate-600">{job.type}</td>
                    <td className="px-4 py-3"><Badge status={job.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{job._count?.applications ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(job)} className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-slate-400 hover:text-[#1E40AF] transition-colors duration-200 cursor-pointer" aria-label="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => openDelete(job)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors duration-200 cursor-pointer" aria-label="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={closeModal}
        title={modal === 'create' ? 'Create Job Posting' : 'Edit Job Posting'} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Job Title" placeholder="e.g. Senior React Developer" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Location" placeholder="e.g. New York, NY (Remote)" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['Full-time', 'Part-time', 'Contract', 'Remote'].map(t => <option key={t}>{t}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </div>
          <Textarea label="Description" placeholder="Describe the role, responsibilities, and requirements..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={5} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{modal === 'create' ? 'Create Job' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={modal === 'delete'} onClose={closeModal} title="Delete Job Posting">
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete <strong>{selected?.title}</strong>? This will also delete all associated applications.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
