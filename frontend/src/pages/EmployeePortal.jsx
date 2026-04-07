import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, User, Building2, Calendar, Clock, LogOut, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, updateTask } from '../api/tasks.api';
import { getInterviews, updateInterview } from '../api/interviews.api';
import { formatDate, formatTime, isPast } from '../utils/date';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const STATUS_NEXT = { TODO: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'TODO' };
const STATUS_BTN = { TODO: 'Start Task', IN_PROGRESS: 'Mark Done', DONE: 'Reopen' };

export default function EmployeePortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null); // interview object
  const [feedbackText, setFeedbackText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getTasks(), getInterviews()])
      .then(([t, i]) => { setTasks(t.data); setInterviews(i.data); })
      .finally(() => setLoading(false));
  }, []);

  const advance = async (task) => {
    const next = STATUS_NEXT[task.status];
    await updateTask(task.id, { status: next });
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: next } : t));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const openFeedback = (iv) => { setFeedbackModal(iv); setFeedbackText(iv.feedback || ''); };
  const closeFeedback = () => { setFeedbackModal(null); setFeedbackText(''); };

  const submitFeedback = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateInterview(feedbackModal.id, { feedback: feedbackText });
      setInterviews((prev) => prev.map((iv) =>
        iv.id === feedbackModal.id ? { ...iv, feedback: feedbackText } : iv
      ));
      closeFeedback();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF6FF]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-[#1E3A8A]">Employee Portal</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors duration-200 cursor-pointer">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Profile card */}
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full flex items-center justify-center">
                <User size={28} className="text-[#1E40AF]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E3A8A]">{user?.name}</h2>
                <p className="text-slate-500 text-sm">{user?.email}</p>
                <Badge status="EMPLOYEE" className="mt-1" />
              </div>
            </div>
          </Card>

          {/* Interviews */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4 flex items-center gap-2">
              <Calendar size={20} /> My Interviews
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse" />)}
              </div>
            ) : interviews.length === 0 ? (
              <Card className="text-center py-8">
                <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No interviews assigned to you yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {interviews.map((iv) => {
                  const past = isPast(iv.scheduledAt);
                  return (
                    <Card key={iv.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1E3A8A]">{iv.application?.candidateName}</p>
                          <p className="text-sm text-slate-500">{iv.application?.job?.title}</p>
                          {iv.notes && <p className="text-xs text-slate-400 mt-1">Note: {iv.notes}</p>}
                          {iv.feedback && (
                            <p className="text-xs text-[#1E40AF] mt-2 bg-[#EFF6FF] rounded-lg px-2 py-1">
                              Feedback submitted
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-[#1E40AF]">
                            <Clock size={14} />
                            {formatDate(iv.scheduledAt)}
                          </div>
                          <p className="text-xs text-slate-400">{formatTime(iv.scheduledAt)}</p>
                          {past ? (
                            <button
                              onClick={() => openFeedback(iv)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#1E40AF] text-white hover:bg-[#1D4ED8] transition-colors duration-200 cursor-pointer"
                            >
                              <MessageSquare size={12} />
                              {iv.feedback ? 'Edit Feedback' : 'Submit Feedback'}
                            </button>
                          ) : (
                            <Badge status="SCHEDULED" />
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div>
            <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4 flex items-center gap-2">
              <CheckSquare size={20} /> My Tasks
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse" />)}
              </div>
            ) : tasks.length === 0 ? (
              <Card className="text-center py-10">
                <CheckSquare size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No tasks assigned yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div key={task.id} layout transition={{ duration: 0.2 }}>
                    <Card className={`${task.status === 'DONE' ? 'opacity-60' : ''} transition-opacity duration-200`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-medium text-[#1E3A8A] ${task.status === 'DONE' ? 'line-through' : ''}`}>
                              {task.title}
                            </p>
                            <Badge status={task.status} />
                          </div>
                          {task.description && <p className="text-sm text-slate-500 truncate">{task.description}</p>}
                          {task.dueDate && (
                            <p className="text-xs text-slate-400 mt-1">Due {formatDate(task.dueDate)}</p>
                          )}
                        </div>
                        <button
                          onClick={() => advance(task)}
                          className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer
                            ${task.status === 'DONE'
                              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              : 'bg-[#1E40AF] text-white hover:bg-[#1D4ED8]'
                            }`}
                        >
                          {STATUS_BTN[task.status]}
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Modal open={!!feedbackModal} onClose={closeFeedback} title="Submit Interview Feedback" maxWidth="max-w-md">
        {feedbackModal && (
          <form onSubmit={submitFeedback} className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Candidate</p>
              <p className="font-medium text-[#1E3A8A]">{feedbackModal.application?.candidateName}</p>
              <p className="text-sm text-slate-500">{feedbackModal.application?.job?.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                required
                placeholder="Share your assessment of the candidate — strengths, concerns, recommendation..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition-colors duration-200 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <Button variant="secondary" type="button" onClick={closeFeedback}>Cancel</Button>
              <Button type="submit" loading={saving}>Submit Feedback</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
