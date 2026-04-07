import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckSquare } from 'lucide-react';
import { formatDate } from '../../utils/date';
import { getTasks, createTask, updateTask, deleteTask } from '../../api/tasks.api';
import { getEmployees } from '../../api/employees.api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';

const EMPTY = { title: '', description: '', assignedToId: '', status: 'TODO', dueDate: '' };
const COLS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board'); // 'board' | 'list'
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const calls = [getTasks()];
    if (isAdmin) calls.push(getEmployees());
    Promise.all(calls).then(([t, e]) => {
      setTasks(t.data);
      if (e) setEmployees(e.data);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); };
  const openEdit = (task) => {
    setForm({ title: task.title, description: task.description || '', assignedToId: task.assignedToId || '', status: task.status, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' });
    setSelected(task);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await createTask(form);
      else await updateTask(selected.id, form);
      load(); closeModal();
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    await updateTask(id, { status });
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await deleteTask(selected.id); load(); closeModal(); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Track and manage team tasks"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              {['board', 'list'].map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm capitalize transition-colors duration-200 cursor-pointer ${view === v ? 'bg-[#1E40AF] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  {v}
                </button>
              ))}
            </div>
            {isAdmin && <Button size="sm" onClick={openCreate}><Plus size={16} /> New Task</Button>}
          </div>
        }
      />

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-4"><TableSkeleton rows={5} cols={4} /></div>
      ) : tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Create tasks and assign them to team members."
          action={isAdmin && <Button size="sm" onClick={openCreate}><Plus size={16} /> Create Task</Button>} />
      ) : view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(COLS).map(([status, label]) => (
            <div key={status} className="bg-white border border-slate-200 rounded-xl">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1E3A8A]">{label}</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="p-3 space-y-2 min-h-[200px]">
                {tasks.filter(t => t.status === status).map((task) => (
                  <div key={task.id} className="bg-[#EFF6FF] border border-slate-200 rounded-lg p-3 hover:border-[#1E40AF] transition-colors duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[#1E3A8A] flex-1">{task.title}</p>
                      {isAdmin && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(task)} className="p-1 rounded hover:bg-white text-slate-400 hover:text-[#1E40AF] transition-colors duration-200 cursor-pointer"><Pencil size={12} /></button>
                          <button onClick={() => { setSelected(task); setModal('delete'); }} className="p-1 rounded hover:bg-white text-slate-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>
                    {task.assignedTo && <p className="text-xs text-slate-500 mt-1">{task.assignedTo.name}</p>}
                    {task.dueDate && <p className="text-xs text-slate-400 mt-1">Due {formatDate(task.dueDate)}</p>}
                    <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="mt-2 text-xs px-2 py-1 rounded border border-slate-200 bg-white text-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E40AF] cursor-pointer w-full">
                      {Object.keys(COLS).map(s => <option key={s} value={s}>{COLS[s]}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Assigned To</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Due Date</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-4 py-3 font-medium text-[#1E3A8A]">{task.title}</td>
                  <td className="px-4 py-3 text-slate-600">{task.assignedTo?.name || '—'}</td>
                  <td className="px-4 py-3"><Badge status={task.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{task.dueDate ? formatDate(task.dueDate) : '—'}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-slate-400 hover:text-[#1E40AF] transition-colors duration-200 cursor-pointer"><Pencil size={14} /></button>
                        <button onClick={() => { setSelected(task); setModal('delete'); }} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal === 'create' || modal === 'edit'} onClose={closeModal}
        title={modal === 'create' ? 'Create Task' : 'Edit Task'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Title" placeholder="Task title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" placeholder="What needs to be done..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <Select label="Assign To" value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}>
            <option value="">Unassigned</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.keys(COLS).map(s => <option key={s} value={s}>{COLS[s]}</option>)}
            </Select>
            <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{modal === 'create' ? 'Create' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'delete'} onClose={closeModal} title="Delete Task">
        <p className="text-slate-600 mb-6">Delete task <strong>{selected?.title}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
