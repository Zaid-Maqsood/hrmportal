const prisma = require('../prisma/client');

exports.getTasks = async (req, res, next) => {
  try {
    const where = {};
    // Employees only see their assigned tasks
    if (req.user.role === 'EMPLOYEE') where.assignedToId = req.user.id;
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedToId, dueDate, status } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignedToId: assignedToId ? Number(assignedToId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'TODO',
        createdById: req.user.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status, assignedToId, dueDate } = req.body;
    const task = await prisma.task.findUnique({ where: { id: Number(req.params.id) } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Employees can only update status of their tasks
    if (req.user.role === 'EMPLOYEE' && task.assignedToId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) data.assignedToId = assignedToId ? Number(assignedToId) : null;

    const updated = await prisma.task.update({ where: { id: Number(req.params.id) }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
