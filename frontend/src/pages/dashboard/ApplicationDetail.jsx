import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, User } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/date';
import { getApplication, updateApplicationStatus } from '../../api/applications.api';
import { createInterview } from '../../api/interviews.api';
import { getEmployees } from '../../api/employees.api';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';

const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: '', interviewerId: '', notes: '' });
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    Promise.all([
      getApplication(id),
      getEmployees(),
    ]).then(([appRes, empRes]) => {
      setApp(appRes.data);
      setEmployees(empRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    await updateApplicationStatus(id, status);
    setApp((prev) => ({ ...prev, status }));
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setScheduleError('');
    setScheduling(true);
    try {
      const payload = {
        applicationId: Number(id),
        scheduledAt: new Date(scheduleForm.scheduledAt).toISOString(),
        interviewerId: Number(scheduleForm.interviewerId),
        notes: scheduleForm.notes,
      };
      const res = await createInterview(payload);
      setApp((prev) => ({ ...prev, interview: res.data, status: 'INTERVIEW' }));
    } catch (err) {
      setScheduleError(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 max-w-2xl">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );

  if (!app) return <p className="text-slate-500">Application not found.</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#1E40AF] mb-6 cursor-pointer transition-colors duration-200">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">{app.candidateName}</h1>
          <p className="text-slate-500 text-sm">{app.candidateEmail}</p>
        </div>
        <Badge status={app.status} />
      </div>

      <div className="space-y-4">
        <Card>
          <h3 className="font-semibold text-[#1E3A8A] mb-4 flex items-center gap-2"><User size={16} /> Application Info</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Job</dt>
              <dd className="font-medium text-[#1E3A8A]">{app.job?.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Location</dt>
              <dd className="text-slate-700">{app.job?.location}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Applied</dt>
              <dd className="text-slate-700">{formatDate(app.appliedAt)}</dd>
            </div>
            {app.resumeUrl && (
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Resume</dt>
                <dd>
                  <a href={app.resumeUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-[#1E40AF] hover:underline cursor-pointer text-sm">
                    <FileText size={14} /> Download
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <h3 className="font-semibold text-[#1E3A8A] mb-4">Update Status</h3>
          <Select value={app.status} onChange={(e) => handleStatusChange(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Card>

        {app.interview ? (
          <Card>
            <h3 className="font-semibold text-[#1E3A8A] mb-4 flex items-center gap-2"><Calendar size={16} /> Interview</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Scheduled</dt>
                <dd className="text-slate-700">{formatDateTime(app.interview.scheduledAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Interviewer</dt>
                <dd className="text-slate-700">{app.interview.interviewer?.name}</dd>
              </div>
              {app.interview.notes && (
                <div>
                  <dt className="text-slate-500 mb-1">Notes</dt>
                  <dd className="text-slate-700 bg-slate-50 p-3 rounded-lg">{app.interview.notes}</dd>
                </div>
              )}
              {app.interview.feedback && (
                <div>
                  <dt className="text-slate-500 mb-1">Feedback</dt>
                  <dd className="text-slate-700 bg-slate-50 p-3 rounded-lg">{app.interview.feedback}</dd>
                </div>
              )}
            </dl>
          </Card>
        ) : (
          <Card>
            <h3 className="font-semibold text-[#1E3A8A] mb-4 flex items-center gap-2"><Calendar size={16} /> Schedule Interview</h3>
            {scheduleError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{scheduleError}</div>
            )}
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <Input
                label="Date & Time"
                type="datetime-local"
                value={scheduleForm.scheduledAt}
                onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                required
              />
              <Select
                label="Interviewer"
                value={scheduleForm.interviewerId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerId: e.target.value })}
                required
              >
                <option value="">Select interviewer</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </Select>
              <Textarea
                label="Notes (optional)"
                placeholder="Interview focus areas..."
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                rows={3}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={scheduling}>Schedule Interview</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
