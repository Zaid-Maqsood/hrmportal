import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Upload, MapPin, Briefcase } from 'lucide-react';
import { getJob } from '../api/jobs.api';
import { applyToJob } from '../api/applications.api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';

export default function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ candidateName: '', candidateEmail: '' });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    getJob(id).then((r) => setJob(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('candidateName', form.candidateName);
      fd.append('candidateEmail', form.candidateEmail);
      fd.append('jobId', id);
      if (resumeFile) fd.append('resume', resumeFile);
      await applyToJob(fd);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="inline-flex w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">Application submitted!</h2>
        <p className="text-slate-500 mb-8">We'll review your application and get back to you soon.</p>
        <Button onClick={() => navigate('/jobs')}>Browse more jobs</Button>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {job && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5 mb-8">
          <h2 className="text-lg font-bold text-[#1E3A8A]">{job.title}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-[#1E40AF]">
            <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase size={14} />{job.type}</span>
          </div>
          <p className="text-sm text-slate-600 mt-3 line-clamp-3">{job.description}</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h1 className="text-xl font-bold text-[#1E3A8A] mb-6">Apply for this position</h1>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Full name" placeholder="Your full name" value={form.candidateName}
            onChange={(e) => setForm({ ...form, candidateName: e.target.value })} required />
          <Input label="Email address" type="email" placeholder="your@email.com" value={form.candidateEmail}
            onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })} required />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#1E3A8A]">Resume (optional)</label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 rounded-lg hover:border-[#1E40AF] transition-colors duration-200 cursor-pointer">
              <Upload size={18} className="text-slate-400" />
              <span className="text-sm text-slate-500">
                {resumeFile ? resumeFile.name : 'Click to upload PDF, DOC, or DOCX (max 5MB)'}
              </span>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])} />
            </label>
          </div>

          <Button type="submit" className="w-full" loading={submitting}>
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  );
}
