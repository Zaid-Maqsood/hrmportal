const prisma = require('../prisma/client');

exports.getInterviews = async (req, res, next) => {
  try {
    const where = req.user.role === 'EMPLOYEE' ? { interviewerId: req.user.id } : {};
    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: { include: { job: { select: { id: true, title: true } } } },
        interviewer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    res.json(interviews);
  } catch (err) {
    next(err);
  }
};

exports.createInterview = async (req, res, next) => {
  try {
    const { applicationId, scheduledAt, interviewerId, notes } = req.body;
    if (!applicationId || !scheduledAt || !interviewerId) {
      return res.status(400).json({ message: 'applicationId, scheduledAt and interviewerId are required' });
    }
    const interview = await prisma.interview.create({
      data: {
        applicationId: Number(applicationId),
        scheduledAt: new Date(scheduledAt),
        interviewerId: Number(interviewerId),
        notes,
      },
      include: {
        application: { include: { job: { select: { title: true } } } },
        interviewer: { select: { id: true, name: true } },
      },
    });
    // Auto-update application status to INTERVIEW
    await prisma.application.update({
      where: { id: Number(applicationId) },
      data: { status: 'INTERVIEW' },
    });
    res.status(201).json(interview);
  } catch (err) {
    next(err);
  }
};

exports.updateInterview = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (req.user.role === 'EMPLOYEE') {
      // Employees may only update feedback on interviews assigned to them
      const existing = await prisma.interview.findUnique({ where: { id } });
      if (!existing || existing.interviewerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const interview = await prisma.interview.update({
        where: { id },
        data: { feedback: req.body.feedback ?? existing.feedback },
      });
      return res.json(interview);
    }

    const { scheduledAt, interviewerId, feedback, notes } = req.body;
    const data = {};
    if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
    if (interviewerId) data.interviewerId = Number(interviewerId);
    if (feedback !== undefined) data.feedback = feedback;
    if (notes !== undefined) data.notes = notes;

    const interview = await prisma.interview.update({ where: { id }, data });
    res.json(interview);
  } catch (err) {
    next(err);
  }
};

exports.deleteInterview = async (req, res, next) => {
  try {
    await prisma.interview.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    next(err);
  }
};
