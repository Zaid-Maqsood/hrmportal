const prisma = require('../prisma/client');

exports.getJobs = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
    const jobs = await prisma.job.findMany({
      where,
      include: { postedBy: { select: { name: true } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: Number(req.params.id) },
      include: { postedBy: { select: { name: true } } },
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const { title, description, location, type, status } = req.body;
    if (!title || !description || !location || !type) {
      return res.status(400).json({ message: 'title, description, location and type are required' });
    }
    const job = await prisma.job.create({
      data: { title, description, location, type, status: status || 'OPEN', postedById: req.user.id },
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await prisma.job.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    await prisma.job.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};
