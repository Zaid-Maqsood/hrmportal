const prisma = require('../prisma/client');

exports.getStats = async (req, res, next) => {
  try {
    const [totalJobs, openJobs, totalApplications, totalHires, totalEmployees, recentApplications, applicationsByStatus, applicationsByJob] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'HIRED' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.application.findMany({
        take: 5,
        orderBy: { appliedAt: 'desc' },
        include: { job: { select: { title: true } } },
      }),
      prisma.application.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.job.findMany({
        take: 5,
        where: { status: 'OPEN' },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      stats: { totalJobs, openJobs, totalApplications, totalHires, totalEmployees },
      recentApplications,
      applicationsByStatus,
      applicationsByJob,
    });
  } catch (err) {
    next(err);
  }
};
