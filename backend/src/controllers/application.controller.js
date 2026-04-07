const prisma = require('../prisma/client');

exports.getApplications = async (req, res, next) => {
  try {
    const { status, jobId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = Number(jobId);
    const applications = await prisma.application.findMany({
      where,
      include: { job: { select: { id: true, title: true } }, interview: true },
      orderBy: { appliedAt: 'desc' },
    });
    res.json(applications);
  } catch (err) {
    next(err);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const app = await prisma.application.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        job: true,
        interview: { include: { interviewer: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (err) {
    next(err);
  }
};

exports.apply = async (req, res, next) => {
  try {
    const { candidateName, candidateEmail, jobId } = req.body;
    if (!candidateName || !candidateEmail || !jobId) {
      return res.status(400).json({ message: 'candidateName, candidateEmail and jobId are required' });
    }
    const job = await prisma.job.findUnique({ where: { id: Number(jobId) } });
    if (!job || job.status === 'CLOSED') {
      return res.status(400).json({ message: 'Job not found or closed' });
    }
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const application = await prisma.application.create({
      data: { candidateName, candidateEmail, resumeUrl, jobId: Number(jobId) },
    });
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const app = await prisma.application.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json(app);
  } catch (err) {
    next(err);
  }
};
