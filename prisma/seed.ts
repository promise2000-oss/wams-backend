import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_COST = 12;

async function main() {
  console.log('Seeding database...');

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'VisionaryGene',
      timezone: 'Africa/Lagos',
    },
  });
  console.log(`Created organization: ${org.id}`);

  // Create departments
  const engDept = await prisma.department.create({
    data: { organizationId: org.id, name: 'Engineering', description: 'Software development and infrastructure' },
  });
  const mktDept = await prisma.department.create({
    data: { organizationId: org.id, name: 'Marketing', description: 'Brand management and digital marketing' },
  });
  const hrDept = await prisma.department.create({
    data: { organizationId: org.id, name: 'HR', description: 'Human resources and talent acquisition' },
  });
  const opsDept = await prisma.department.create({
    data: { organizationId: org.id, name: 'Operations', description: 'Business operations and logistics' },
  });

  // Create shifts
  const morningShift = await prisma.shift.create({
    data: {
      organizationId: org.id,
      name: 'Morning Shift',
      startTime: '08:00',
      endTime: '17:00',
      gracePeriodMinutes: 15,
      breakDurationMinutes: 60,
      workingDays: '1,2,3,4,5',
      overtimeRules: { max_overtime_minutes: 120, rate_multiplier: 1.5 },
      status: 'ACTIVE',
    },
  });

  const afternoonShift = await prisma.shift.create({
    data: {
      organizationId: org.id,
      name: 'Afternoon Shift',
      startTime: '14:00',
      endTime: '23:00',
      gracePeriodMinutes: 15,
      breakDurationMinutes: 60,
      workingDays: '1,2,3,4,5',
      overtimeRules: { max_overtime_minutes: 120, rate_multiplier: 1.5 },
      status: 'ACTIVE',
    },
  });

  // Create users
  const passwordHash = await bcrypt.hash('password123', BCRYPT_COST);

  const superAdmin = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Dr. Amina Okafor',
      email: 'super@visionarygene.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      shiftId: morningShift.id,
      position: 'Chief Executive Officer',
      status: 'ACTIVE',
    },
  });

  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Tunde Adeyemi',
      email: 'admin@visionarygene.com',
      passwordHash,
      role: 'ADMIN',
      shiftId: morningShift.id,
      position: 'Operations Director',
      managerId: superAdmin.id,
      status: 'ACTIVE',
    },
  });

  const engManager = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Emeka Nwosu',
      email: 'engineering-lead@visionarygene.com',
      passwordHash,
      role: 'MANAGER',
      departmentId: engDept.id,
      shiftId: morningShift.id,
      position: 'Engineering Manager',
      managerId: admin.id,
      status: 'ACTIVE',
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Chidinma Eze',
      email: 'chidinma.eze@visionarygene.com',
      passwordHash,
      role: 'EMPLOYEE',
      departmentId: engDept.id,
      shiftId: morningShift.id,
      position: 'Senior Software Engineer',
      managerId: engManager.id,
      status: 'ACTIVE',
    },
  });

  // Create leave types
  await prisma.leaveType.createMany({
    data: [
      { organizationId: org.id, name: 'Annual Leave', defaultDays: 21, accrualPolicy: { type: 'monthly', rate: 1.75 }, carryOverMaxDays: 5, status: 'ACTIVE' },
      { organizationId: org.id, name: 'Sick Leave', defaultDays: 12, carryOverMaxDays: 0, status: 'ACTIVE' },
      { organizationId: org.id, name: 'Casual Leave', defaultDays: 7, carryOverMaxDays: 0, status: 'ACTIVE' },
      { organizationId: org.id, name: 'Emergency Leave', defaultDays: 5, carryOverMaxDays: 0, status: 'ACTIVE' },
      { organizationId: org.id, name: 'Maternity Leave', defaultDays: 90, carryOverMaxDays: 0, status: 'ACTIVE' },
      { organizationId: org.id, name: 'Paternity Leave', defaultDays: 10, carryOverMaxDays: 0, status: 'ACTIVE' },
    ],
  });

  // Create shift assignments
  await prisma.shiftAssignment.createMany({
    data: [
      { organizationId: org.id, shiftId: morningShift.id, employeeId: superAdmin.id, effectiveFrom: new Date('2023-01-15') },
      { organizationId: org.id, shiftId: morningShift.id, employeeId: admin.id, effectiveFrom: new Date('2023-03-15') },
      { organizationId: org.id, shiftId: morningShift.id, employeeId: engManager.id, effectiveFrom: new Date('2023-02-01') },
      { organizationId: org.id, shiftId: morningShift.id, employeeId: employee1.id, effectiveFrom: new Date('2023-07-01') },
    ],
  });

  console.log('Seed completed!');
  console.log(`Organization: ${org.name} (${org.id})`);
  console.log(`Login: super@visionarygene.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
