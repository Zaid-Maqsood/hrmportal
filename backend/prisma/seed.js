const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const rawUrl = process.env.DATABASE_URL || '';
const isProd = rawUrl.includes('ondigitalocean.com');
const cleaned = rawUrl
  .replace(/([?&])sslmode=[^&]*/g, '$1')
  .replace(/([?&])schema=[^&]*/g, '$1')
  .replace(/[?&]$/, '');
const sep = cleaned.includes('?') ? '&' : '?';
const connectionString = `${cleaned}${sep}options=-c+search_path%3Dhrm`;

const pool = new Pool({
  connectionString,
  ...(isProd && { ssl: { rejectUnauthorized: false } }),
});
const adapter = new PrismaPg(pool, { schema: 'hrm' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const empPassword = await bcrypt.hash('employee123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hrm.com' },
    update: { password: adminPassword },
    create: { name: 'Alex Johnson', email: 'admin@hrm.com', password: adminPassword, role: 'ADMIN' },
  });

  const emp1 = await prisma.user.upsert({
    where: { email: 'sarah@hrm.com' },
    update: { password: empPassword },
    create: { name: 'Sarah Williams', email: 'sarah@hrm.com', password: empPassword, role: 'EMPLOYEE' },
  });

  const emp2 = await prisma.user.upsert({
    where: { email: 'mike@hrm.com' },
    update: { password: empPassword },
    create: { name: 'Mike Chen', email: 'mike@hrm.com', password: empPassword, role: 'EMPLOYEE' },
  });

  // Employee Profiles
  await prisma.employeeProfile.upsert({
    where: { userId: emp1.id },
    update: {},
    create: { userId: emp1.id, department: 'Engineering', position: 'Frontend Developer', phone: '+1-555-0101' },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: emp2.id },
    update: {},
    create: { userId: emp2.id, department: 'Design', position: 'UI/UX Designer', phone: '+1-555-0102' },
  });

  // Jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior React Developer',
      description: 'We are looking for an experienced React developer to join our team. You will work on building scalable web applications.',
      location: 'New York, NY (Remote)',
      type: 'Full-time',
      status: 'OPEN',
      postedById: admin.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Product Designer',
      description: 'Join our design team to create beautiful and functional user experiences for our HR platform.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'OPEN',
      postedById: admin.id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Node.js Backend Engineer',
      description: 'Backend engineer with experience in Node.js, PostgreSQL, and REST API design.',
      location: 'Remote',
      type: 'Contract',
      status: 'CLOSED',
      postedById: admin.id,
    },
  });

  // Applications
  const app1 = await prisma.application.create({
    data: {
      candidateName: 'Emma Davis',
      candidateEmail: 'emma.davis@email.com',
      status: 'HIRED',
      jobId: job1.id,
    },
  });

  const app2 = await prisma.application.create({
    data: {
      candidateName: 'James Wilson',
      candidateEmail: 'james.w@email.com',
      status: 'SHORTLISTED',
      jobId: job1.id,
    },
  });

  const app3 = await prisma.application.create({
    data: {
      candidateName: 'Priya Patel',
      candidateEmail: 'priya.p@email.com',
      status: 'INTERVIEW',
      jobId: job2.id,
    },
  });

  const app4 = await prisma.application.create({
    data: {
      candidateName: 'Carlos Mendez',
      candidateEmail: 'carlos.m@email.com',
      status: 'APPLIED',
      jobId: job2.id,
    },
  });

  const app5 = await prisma.application.create({
    data: {
      candidateName: 'Rachel Kim',
      candidateEmail: 'rachel.k@email.com',
      status: 'REJECTED',
      jobId: job3.id,
    },
  });

  // Interviews
  await prisma.interview.create({
    data: {
      applicationId: app2.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      interviewerId: emp1.id,
      notes: 'Technical interview focusing on React and system design.',
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: app3.id,
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      interviewerId: emp2.id,
      notes: 'Portfolio review and design challenge discussion.',
      feedback: 'Strong portfolio. Good communication skills.',
    },
  });

  // Tasks
  await prisma.task.create({
    data: {
      title: 'Update onboarding documentation',
      description: 'Review and update the employee onboarding docs to reflect new processes.',
      status: 'IN_PROGRESS',
      assignedToId: emp1.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Design new job posting template',
      description: 'Create a standardized template for job postings across all departments.',
      status: 'TODO',
      assignedToId: emp2.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Q2 performance reviews',
      description: 'Complete all Q2 employee performance review forms.',
      status: 'DONE',
      assignedToId: emp1.id,
      createdById: admin.id,
    },
  });

  console.log('Seed complete!');
  console.log('Login credentials:');
  console.log('  Admin:    admin@hrm.com / admin123');
  console.log('  Employee: sarah@hrm.com / employee123');
  console.log('  Employee: mike@hrm.com  / employee123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
