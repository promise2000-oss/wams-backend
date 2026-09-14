import { DateTime } from 'luxon';
import prisma from '../../shared/db/prisma';
import { parsePagination, paginatedResponse } from '../../shared/lib/pagination';
import { Request, Response } from 'express';

export async function getDashboardMetrics(req: Request, res: Response) {
  const { dateFrom, dateTo } = req.query;
  const org = await prisma.organization.findUnique({ where: { id: req.user!.organizationId } });
  const timezone = org?.timezone || 'Africa/Lagos';
  const workDate = dateFrom as string || DateTime.now().setZone(timezone).toISODate()!;

  const totalEmployees = await prisma.user.count({
    where: { organizationId: req.user!.organizationId, status: 'ACTIVE' },
  });

  const todayAttendance = await prisma.attendance.findMany({
    where: {
      organizationId: req.user!.organizationId,
      workDate: new Date(workDate),
    },
  });

  const present = todayAttendance.filter((a: any) => a.status === 'PRESENT').length;
  const late = todayAttendance.filter((a: any) => a.status === 'LATE').length;
  const absent = totalEmployees - todayAttendance.length;
  const onLeave = todayAttendance.filter((a: any) => a.status === 'ON_LEAVE').length;

  const totalWorked = todayAttendance.reduce((sum: number, a: any) => sum + a.workedMinutes, 0);
  const totalOvertime = todayAttendance.reduce((sum: number, a: any) => sum + a.overtimeMinutes, 0);
  const avgWorkingHours = todayAttendance.length > 0 ? totalWorked / todayAttendance.length / 60 : 0;

  const attendanceRate = totalEmployees > 0 ? ((present + late) / totalEmployees) * 100 : 0;

  res.json({
    total_employees: totalEmployees,
    present,
    late,
    absent,
    on_leave: onLeave,
    average_attendance_rate: Math.round(attendanceRate * 10) / 10,
    average_working_hours: Math.round(avgWorkingHours * 10) / 10,
    overtime_hours: Math.round(totalOvertime / 60 * 10) / 10,
    last_updated: new Date().toISOString(),
  });
}

export async function getAttendanceTrend(req: Request, res: Response) {
  const { dateFrom, dateTo } = req.query;
  const days = parseInt(req.query.days as string) || 30;

  const records = await prisma.attendance.findMany({
    where: {
      organizationId: req.user!.organizationId,
      workDate: {
        gte: new Date(DateTime.now().minus({ days }).toISODate()),
      },
    },
    orderBy: { workDate: 'asc' },
  });

  // Group by date
  const byDate = new Map<string, { total: number; present: number }>();
  for (const r of records) {
    const date = r.workDate.toISOString().split('T')[0];
    const existing = byDate.get(date) || { total: 0, present: 0 };
    existing.total++;
    if (r.status === 'PRESENT' || r.status === 'LATE') existing.present++;
    byDate.set(date, existing);
  }

  const trend = Array.from(byDate.entries()).map(([date, data]) => ({
    date,
    rate: data.total > 0 ? Math.round((data.present / data.total) * 1000) / 10 : 0,
  }));

  res.json(trend);
}

export async function getLateArrivalTrend(req: Request, res: Response) {
  const days = parseInt(req.query.days as string) || 30;

  const records = await prisma.attendance.findMany({
    where: {
      organizationId: req.user!.organizationId,
      status: 'LATE',
      workDate: {
        gte: new Date(DateTime.now().minus({ days }).toISODate()),
      },
    },
    orderBy: { workDate: 'asc' },
  });

  const byDate = new Map<string, number>();
  for (const r of records) {
    const date = r.workDate.toISOString().split('T')[0];
    byDate.set(date, (byDate.get(date) || 0) + 1);
  }

  const trend = Array.from(byDate.entries()).map(([date, count]) => ({ date, count }));
  res.json(trend);
}

export async function getWorkHours(req: Request, res: Response) {
  const days = parseInt(req.query.days as string) || 30;

  const records = await prisma.attendance.findMany({
    where: {
      organizationId: req.user!.organizationId,
      workedMinutes: { gt: 0 },
      workDate: {
        gte: new Date(DateTime.now().minus({ days }).toISODate()),
      },
    },
    include: { employee: true },
  });

  const byEmployee = new Map<string, { name: string; totalMinutes: number; count: number }>();
  for (const r of records) {
    const existing = byEmployee.get(r.employeeId) || { name: r.employee.name, totalMinutes: 0, count: 0 };
    existing.totalMinutes += r.workedMinutes;
    existing.count++;
    byEmployee.set(r.employeeId, existing);
  }

  const result = Array.from(byEmployee.entries()).map(([id, data]) => ({
    employee_id: id,
    employee_name: data.name,
    avg_hours: Math.round((data.totalMinutes / data.count / 60) * 10) / 10,
  }));

  res.json(result);
}

export async function getDepartmentComparison(req: Request, res: Response) {
  const departments = await prisma.department.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { users: { where: { status: 'ACTIVE' } } },
  });

  const result = [];
  for (const dept of departments) {
    const employeeIds = dept.users.map((u: any) => u.id);
    if (employeeIds.length === 0) continue;

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: { in: employeeIds },
        workDate: {
          gte: new Date(DateTime.now().minus({ days: 30 }).toISODate()),
        },
      },
    });

    const present = attendance.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const rate = attendance.length > 0 ? (present / attendance.length) * 100 : 0;

    result.push({
      department_id: dept.id,
      department_name: dept.name,
      attendance_rate: Math.round(rate * 10) / 10,
    });
  }

  res.json(result);
}

export async function getAnomalies(req: Request, res: Response) {
  const employees = await prisma.user.findMany({
    where: { organizationId: req.user!.organizationId, status: 'ACTIVE' },
    include: { department: true },
  });

  const anomalies = [];
  for (const emp of employees) {
    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: emp.id,
        workDate: { gte: new Date(DateTime.now().minus({ days: 30 }).toISODate()) },
      },
    });

    const lateCount = attendance.filter((a: any) => a.status === 'LATE').length;
    const absentCount = attendance.filter((a: any) => a.status === 'ABSENT').length;
    const correctionCount = await prisma.attendanceCorrection.count({
      where: { employeeId: emp.id },
    });

    if (lateCount >= 5) {
      anomalies.push({
        employee_id: emp.id,
        employee_name: emp.name,
        department_name: emp.department?.name,
        type: 'CHRONIC_LATENESS',
        severity: lateCount >= 8 ? 'HIGH' : 'MEDIUM',
        details: `${lateCount} late arrivals in the last 30 days.`,
      });
    }

    if (absentCount >= 4) {
      anomalies.push({
        employee_id: emp.id,
        employee_name: emp.name,
        department_name: emp.department?.name,
        type: 'FREQUENT_ABSENCE',
        severity: absentCount >= 6 ? 'HIGH' : 'MEDIUM',
        details: `${absentCount} absences in the last 30 days.`,
      });
    }

    if (correctionCount >= 3) {
      anomalies.push({
        employee_id: emp.id,
        employee_name: emp.name,
        department_name: emp.department?.name,
        type: 'HIGH_CORRECTION_RATE',
        severity: correctionCount >= 5 ? 'MEDIUM' : 'LOW',
        details: `${correctionCount} correction requests in the last 30 days.`,
      });
    }
  }

  res.json(anomalies);
}

export async function getBenchmark(req: Request, res: Response) {
  // Compare department vs organization-wide metrics
  res.json([]);
}

export async function listSnapshots(req: Request, res: Response) {
  // For MVP, return empty array - snapshots stored in a dedicated table later
  res.json([]);
}

export async function createSnapshot(req: Request, res: Response) {
  const { name, date_from, date_to } = req.body;

  // For MVP, just acknowledge
  res.status(201).json({
    id: `SNAP-${Date.now()}`,
    name,
    date: date_from,
    metrics: {},
    created_at: new Date().toISOString(),
  });
}
