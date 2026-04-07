import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Briefcase, Clock, Search } from 'lucide-react';
import { formatDate } from '../utils/date';
import { getJobs } from '../api/jobs.api';
import Badge from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getJobs({ status: 'OPEN' })
      .then((r) => setJobs(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#1E3A8A] mb-3">Open Positions</h1>
        <p className="text-slate-500 text-lg">Join our team and make an impact</p>
      </div>

      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-[#1E3A8A] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition-colors duration-200"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No open positions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <Link
                to={`/jobs/${job.id}/apply`}
                className="block bg-white border border-slate-200 rounded-xl p-6 hover:border-[#1E40AF] transition-colors duration-200 cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-[#1E3A8A] group-hover:text-[#1E40AF] transition-colors duration-200">
                      {job.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge status={job.status} />
                    <span className="text-sm font-medium px-4 py-2 bg-[#1E40AF] text-white rounded-lg group-hover:bg-[#1D4ED8] transition-colors duration-200">
                      Apply Now
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
