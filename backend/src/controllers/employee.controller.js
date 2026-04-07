const prisma = require('../prisma/client');

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        employeeProfile: true,
        assignedTasks: { select: { id: true, title: true, status: true } },
      },
    });
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await prisma.user.findFirst({
      where: { id: Number(req.params.id), role: 'EMPLOYEE' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        employeeProfile: true,
        assignedTasks: {
          include: { createdBy: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { name, department, position, phone } = req.body;
    const userId = Number(req.params.id);

    const updates = [];
    if (name) updates.push(prisma.user.update({ where: { id: userId }, data: { name } }));

    if (department || position || phone) {
      updates.push(
        prisma.employeeProfile.upsert({
          where: { userId },
          update: { department, position, phone },
          create: { userId, department: department || '', position: position || '', phone },
        })
      );
    }

    await prisma.$transaction(updates);
    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, employeeProfile: true },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
