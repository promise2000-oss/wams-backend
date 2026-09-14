const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'WAMS — Workforce Attendance & Management System',
    description:
      'REST API for workforce attendance tracking, shift management, leave management, analytics, and reporting. ' +
      'Built with Express.js + TypeScript + Prisma ORM + PostgreSQL.',
    version: '1.0.0',
    contact: { name: 'WAMS Team' },
    license: { name: 'MIT' },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local development' },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & user management' },
    { name: 'Employees', description: 'Employee CRUD and lifecycle' },
    { name: 'Departments', description: 'Department management' },
    { name: 'Shifts', description: 'Shift templates and assignments' },
    { name: 'Attendance', description: 'Clock-in / clock-out, history, corrections' },
    { name: 'Leave', description: 'Leave types, balances, requests, delegates' },
    { name: 'Notifications', description: 'In-app notifications and preferences' },
    { name: 'Analytics', description: 'Dashboard metrics, trends, anomalies' },
    { name: 'Reports', description: 'Report generation and downloads' },
    { name: 'Audit', description: 'Audit log trail' },
    { name: 'Health', description: 'Service health checks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from POST /api/v1/auth/login',
      },
    },
    schemas: {
      // ── Common ──
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'UNAUTHORIZED' },
              message: { type: 'string', example: 'Missing or invalid authorization header' },
              requestId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: {} },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      // ── Auth ──
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@company.com' },
          password: { type: 'string', minLength: 1, example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', description: 'JWT access token' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'organizationName'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@company.com' },
          password: { type: 'string', minLength: 8, maxLength: 128 },
          organizationName: { type: 'string', minLength: 1, maxLength: 200, example: 'Acme Corp' },
          timezone: { type: 'string', example: 'Africa/Lagos' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organizationId: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          departmentId: { type: 'string', format: 'uuid', nullable: true },
          managerId: { type: 'string', format: 'uuid', nullable: true },
          shiftId: { type: 'string', format: 'uuid', nullable: true },
          position: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', minLength: 1 },
          newPassword: { type: 'string', minLength: 8, maxLength: 128 },
        },
      },
      // ── Employees ──
      CreateEmployeeRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 128 },
          role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
          phone: { type: 'string' },
          departmentId: { type: 'string', format: 'uuid' },
          managerId: { type: 'string', format: 'uuid' },
          shiftId: { type: 'string', format: 'uuid' },
          position: { type: 'string' },
        },
      },
      UpdateEmployeeRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
          phone: { type: 'string', nullable: true },
          departmentId: { type: 'string', format: 'uuid', nullable: true },
          managerId: { type: 'string', format: 'uuid', nullable: true },
          shiftId: { type: 'string', format: 'uuid', nullable: true },
          position: { type: 'string', nullable: true },
        },
      },
      // ── Departments ──
      Department: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          manager_id: { type: 'string', format: 'uuid', nullable: true },
          employee_count: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateDepartmentRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string' },
          managerId: { type: 'string', format: 'uuid' },
        },
      },
      // ── Shifts ──
      Shift: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          start_time: { type: 'string', example: '09:00' },
          end_time: { type: 'string', example: '17:00' },
          grace_period_minutes: { type: 'integer' },
          break_duration_minutes: { type: 'integer' },
          working_days: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3, 4, 5] },
          overtime_rules: { type: 'object', nullable: true },
          status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'] },
          employee_count: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateShiftRequest: {
        type: 'object',
        required: ['name', 'start_time', 'end_time'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          start_time: { type: 'string', pattern: '^\\d{2}:\\d{2}$', example: '09:00' },
          end_time: { type: 'string', pattern: '^\\d{2}:\\d{2}$', example: '17:00' },
          grace_period_minutes: { type: 'integer', minimum: 0, maximum: 120 },
          break_duration_minutes: { type: 'integer', minimum: 0, maximum: 120 },
          working_days: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 }, example: [1, 2, 3, 4, 5] },
          overtime_rules: {
            type: 'object',
            properties: {
              max_overtime_minutes: { type: 'integer', minimum: 0 },
              rate_multiplier: { type: 'number', minimum: 1, maximum: 5 },
            },
          },
        },
      },
      ShiftAssignment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          shift_id: { type: 'string', format: 'uuid' },
          employee_id: { type: 'string', format: 'uuid' },
          employee_name: { type: 'string' },
          shift_name: { type: 'string' },
          effective_from: { type: 'string', format: 'date' },
          effective_to: { type: 'string', format: 'date', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateAssignmentRequest: {
        type: 'object',
        required: ['shift_id', 'employee_id', 'effective_from'],
        properties: {
          shift_id: { type: 'string', format: 'uuid' },
          employee_id: { type: 'string', format: 'uuid' },
          effective_from: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-01-01' },
          effective_to: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        },
      },
      // ── Attendance ──
      Attendance: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          employee_id: { type: 'string', format: 'uuid' },
          employee_name: { type: 'string' },
          shift_id: { type: 'string', format: 'uuid' },
          shift_name: { type: 'string' },
          work_date: { type: 'string', format: 'date' },
          clock_in: { type: 'string', format: 'date-time', nullable: true },
          clock_out: { type: 'string', format: 'date-time', nullable: true },
          scheduled_start: { type: 'string', format: 'date-time' },
          scheduled_end: { type: 'string', format: 'date-time' },
          late_minutes: { type: 'integer' },
          early_departure_minutes: { type: 'integer' },
          worked_minutes: { type: 'integer' },
          overtime_minutes: { type: 'integer' },
          break_minutes: { type: 'integer' },
          status: { type: 'string', enum: ['PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE', 'HOLIDAY', 'OFF_DAY', 'CLOCK', 'PENDING_CORRECTION'] },
          source: { type: 'string', enum: ['CLOCK', 'CORRECTION', 'AUTO'] },
          notes: { type: 'string', nullable: true },
          department_name: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ClockInRequest: {
        type: 'object',
        properties: {
          notes: { type: 'string' },
        },
      },
      Correction: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          attendance_id: { type: 'string', format: 'uuid' },
          employee_id: { type: 'string', format: 'uuid' },
          employee_name: { type: 'string' },
          work_date: { type: 'string', format: 'date' },
          requested_clock_in: { type: 'string', format: 'date-time' },
          requested_clock_out: { type: 'string', format: 'date-time' },
          reason: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          reviewed_by: { type: 'string', format: 'uuid', nullable: true },
          reviewed_by_name: { type: 'string', nullable: true },
          review_notes: { type: 'string', nullable: true },
          reviewed_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      SubmitCorrectionRequest: {
        type: 'object',
        required: ['attendance_id', 'requested_clock_in', 'requested_clock_out', 'reason'],
        properties: {
          attendance_id: { type: 'string', format: 'uuid' },
          requested_clock_in: { type: 'string', format: 'date-time' },
          requested_clock_out: { type: 'string', format: 'date-time' },
          reason: { type: 'string', minLength: 1, maxLength: 500 },
        },
      },
      ReviewCorrectionRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
          review_notes: { type: 'string' },
        },
      },
      // ── Leave ──
      LeaveType: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          days_per_year: { type: 'integer' },
          accrual_policy: { type: 'object', nullable: true },
          carry_over_max_days: { type: 'integer' },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      LeaveBalance: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          employee_id: { type: 'string', format: 'uuid' },
          leave_type_id: { type: 'string', format: 'uuid' },
          leave_type_name: { type: 'string' },
          year: { type: 'integer' },
          total_days: { type: 'number' },
          used_days: { type: 'number' },
          pending_days: { type: 'number' },
          carried_over_days: { type: 'number' },
          accrued_days: { type: 'number' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      LeaveRequest: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          employee_id: { type: 'string', format: 'uuid' },
          employee_name: { type: 'string' },
          leave_type_id: { type: 'string', format: 'uuid' },
          leave_type_name: { type: 'string' },
          start_date: { type: 'string', format: 'date' },
          end_date: { type: 'string', format: 'date' },
          is_half_day: { type: 'boolean' },
          half_day_period: { type: 'string', enum: ['AM', 'PM'], nullable: true },
          reason: { type: 'string' },
          document_url: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          approved_by: { type: 'string', format: 'uuid', nullable: true },
          approved_by_name: { type: 'string', nullable: true },
          rejection_reason: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateLeaveRequest: {
        type: 'object',
        required: ['leave_type_id', 'start_date', 'end_date', 'reason'],
        properties: {
          leave_type_id: { type: 'string', format: 'uuid' },
          start_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-09-20' },
          end_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-09-25' },
          is_half_day: { type: 'boolean' },
          half_day_period: { type: 'string', enum: ['AM', 'PM'] },
          reason: { type: 'string', minLength: 1, maxLength: 500 },
          document_url: { type: 'string' },
        },
      },
      Delegate: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          managerId: { type: 'string', format: 'uuid' },
          delegateId: { type: 'string', format: 'uuid' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      CreateDelegateRequest: {
        type: 'object',
        required: ['delegate_id', 'start_date', 'end_date'],
        properties: {
          delegate_id: { type: 'string', format: 'uuid' },
          start_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          end_date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        },
      },
      BulkApproveRequest: {
        type: 'object',
        required: ['ids'],
        properties: {
          ids: { type: 'array', items: { type: 'string', format: 'uuid' }, minItems: 1 },
        },
      },
      // ── Notifications ──
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organization_id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
          delivery_channel: { type: 'string' },
          is_read: { type: 'boolean' },
          delivered_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      NotificationPreference: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          channel: { type: 'string' },
          enabled: { type: 'boolean' },
          preference: { type: 'string' },
        },
      },
      // ── Analytics ──
      DashboardMetrics: {
        type: 'object',
        properties: {
          total_employees: { type: 'integer' },
          present: { type: 'integer' },
          late: { type: 'integer' },
          absent: { type: 'integer' },
          on_leave: { type: 'integer' },
          average_attendance_rate: { type: 'number' },
          average_working_hours: { type: 'number' },
          overtime_hours: { type: 'number' },
          last_updated: { type: 'string', format: 'date-time' },
        },
      },
      AttendanceTrend: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date' },
          rate: { type: 'number' },
        },
      },
      LateArrivalTrend: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date' },
          count: { type: 'integer' },
        },
      },
      WorkHoursSummary: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', format: 'uuid' },
          employee_name: { type: 'string' },
          avg_hours: { type: 'number' },
        },
      },
      DepartmentComparison: {
        type: 'object',
        properties: {
          department_id: { type: 'string', format: 'uuid' },
          department_name: { type: 'string' },
          attendance_rate: { type: 'number' },
        },
      },
      Anomaly: {
        type: 'object',
        properties: {
          employee_id: { type: 'string', format: 'uuid' },
          employee_name: { type: 'string' },
          department_name: { type: 'string', nullable: true },
          type: { type: 'string', enum: ['CHRONIC_LATENESS', 'FREQUENT_ABSENCE', 'HIGH_CORRECTION_RATE'] },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          details: { type: 'string' },
        },
      },
      // ── Reports ──
      Report: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          status: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      GenerateReportRequest: {
        type: 'object',
        required: ['type', 'filters'],
        properties: {
          type: { type: 'string', enum: ['ATTENDANCE', 'LEAVE', 'SHIFT'] },
          filters: { type: 'object', additionalProperties: true },
        },
      },
      // ── Audit ──
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          organizationId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          action: { type: 'string' },
          entity: { type: 'string' },
          entityId: { type: 'string', nullable: true },
          oldValues: { type: 'object', nullable: true },
          newValues: { type: 'object', nullable: true },
          ipAddress: { type: 'string', nullable: true },
          userAgent: { type: 'string', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      // ── Health ──
      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['healthy', 'degraded'] },
          checks: {
            type: 'object',
            properties: {
              postgres: { type: 'string', example: 'ok' },
              redis: { type: 'string', example: 'ok' },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // ════════════════════════════════════════════
    //  HEALTH
    // ════════════════════════════════════════════
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        description: 'Returns connectivity status for PostgreSQL and Redis.',
        security: [],
        responses: {
          '200': {
            description: 'All systems operational',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthCheck' } } },
          },
          '503': {
            description: 'One or more dependencies degraded',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthCheck' } } },
          },
        },
      },
    },

    // ════════════════════════════════════════════
    //  AUTH
    // ════════════════════════════════════════════
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        description: 'Authenticate with email/password. Returns a JWT access token and sets an HttpOnly refresh-token cookie.',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '429': { description: 'Rate limited' },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new organization + admin',
        description: 'Creates an organization and its first admin user.',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': {
            description: 'Registration successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Rotate refresh token and issue a new access token. Refresh token is sent as an HttpOnly cookie.',
        security: [],
        responses: {
          '200': {
            description: 'Token refreshed',
            content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } },
          },
          '401': { description: 'Refresh token invalid or reused' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out',
        description: 'Revokes the current refresh token and clears the cookie.',
        security: [],
        responses: {
          '204': { description: 'Logged out' },
        },
      },
    },
    '/api/v1/auth/logout-all': {
      post: {
        tags: ['Auth'],
        summary: 'Log out all sessions',
        description: 'Revokes all refresh tokens for the authenticated user.',
        responses: {
          '204': { description: 'All sessions revoked' },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Returns the profile of the currently authenticated user.',
        responses: {
          '200': {
            description: 'User profile',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '401': { description: 'Not authenticated' },
        },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        description: 'Sends a password-reset email (MVP: logs token to console).',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'If the email exists, a reset link was sent' },
        },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password updated' },
          '400': { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/v1/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password',
        description: 'Change the authenticated user\'s password.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
        },
        responses: {
          '200': { description: 'Password changed' },
          '401': { description: 'Current password incorrect' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  EMPLOYEES
    // ════════════════════════════════════════════
    '/api/v1/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List employees',
        description: 'Returns a paginated list of employees in the organization.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'departmentId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Paginated employee list',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Employees'],
        summary: 'Create employee',
        description: 'Admin/SuperAdmin only. Creates a new employee record.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEmployeeRequest' } } },
        },
        responses: {
          '201': { description: 'Employee created', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/v1/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get employee by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Employee details', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Employees'],
        summary: 'Update employee',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateEmployeeRequest' } } },
        },
        responses: {
          '200': { description: 'Employee updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/employees/{id}/deactivate': {
      post: {
        tags: ['Employees'],
        summary: 'Deactivate employee',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Employee deactivated' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/employees/{id}/reactivate': {
      post: {
        tags: ['Employees'],
        summary: 'Reactivate employee',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Employee reactivated' },
          '404': { description: 'Not found' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  DEPARTMENTS
    // ════════════════════════════════════════════
    '/api/v1/departments': {
      get: {
        tags: ['Departments'],
        summary: 'List departments',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated department list',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Department' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Departments'],
        summary: 'Create department',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDepartmentRequest' } } },
        },
        responses: {
          '201': { description: 'Department created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Department' } } } },
        },
      },
    },
    '/api/v1/departments/{id}': {
      put: {
        tags: ['Departments'],
        summary: 'Update department',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', nullable: true },
                  managerId: { type: 'string', format: 'uuid', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Department updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Department' } } } },
          '404': { description: 'Not found' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  SHIFTS
    // ════════════════════════════════════════════
    '/api/v1/shifts': {
      get: {
        tags: ['Shifts'],
        summary: 'List shifts',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated shift list',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Shift' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Shifts'],
        summary: 'Create shift',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateShiftRequest' } } },
        },
        responses: {
          '201': { description: 'Shift created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
        },
      },
    },
    '/api/v1/shifts/{id}': {
      get: {
        tags: ['Shifts'],
        summary: 'Get shift by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Shift details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Shifts'],
        summary: 'Update shift',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateShiftRequest' } } },
        },
        responses: {
          '200': { description: 'Shift updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/shifts/{id}/archive': {
      post: {
        tags: ['Shifts'],
        summary: 'Archive shift',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Shift archived', content: { 'application/json': { schema: { $ref: '#/components/schemas/Shift' } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/shift-assignments': {
      get: {
        tags: ['Shifts'],
        summary: 'List shift assignments',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'shiftId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'employeeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Paginated assignment list',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ShiftAssignment' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Shifts'],
        summary: 'Create shift assignment',
        description: 'Assign an employee to a shift for a date range. Overlapping assignments are rejected.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAssignmentRequest' } } },
        },
        responses: {
          '201': { description: 'Assignment created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ShiftAssignment' } } } },
          '409': { description: 'Overlapping assignment' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  ATTENDANCE
    // ════════════════════════════════════════════
    '/api/v1/attendance/clock-in': {
      post: {
        tags: ['Attendance'],
        summary: 'Clock in',
        description: 'Record the current time as clock-in for today. Idempotent — repeated calls within the same window return the existing record.',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ClockInRequest' } } },
        },
        responses: {
          '201': { description: 'Clock-in recorded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendance' } } } },
          '409': { description: 'Already clocked in' },
        },
      },
    },
    '/api/v1/attendance/clock-out': {
      post: {
        tags: ['Attendance'],
        summary: 'Clock out',
        description: 'Record the current time as clock-out. Calculates worked minutes, overtime, and early departure.',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ClockInRequest' } } },
        },
        responses: {
          '200': { description: 'Clock-out recorded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendance' } } } },
          '404': { description: 'No clock-in found for today' },
          '409': { description: 'Already clocked out' },
        },
      },
    },
    '/api/v1/attendance/today': {
      get: {
        tags: ['Attendance'],
        summary: 'Get today\'s status',
        description: 'Returns the attendance record for the current work date, or null if not clocked in.',
        responses: {
          '200': {
            description: 'Today\'s attendance',
            content: { 'application/json': { schema: { oneOf: [{ $ref: '#/components/schemas/Attendance' }, { type: 'null' }] } } },
          },
        },
      },
    },
    '/api/v1/attendance/history': {
      get: {
        tags: ['Attendance'],
        summary: 'Attendance history',
        description: 'Paginated attendance history. Employees see only their own records.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'shiftId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'employeeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Paginated attendance records',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } } } }] } } },
          },
        },
      },
    },
    '/api/v1/attendance/team-live': {
      get: {
        tags: ['Attendance'],
        summary: 'Team live view',
        description: 'Returns today\'s attendance for all team members (Manager/Admin only).',
        responses: {
          '200': {
            description: 'Live team attendance',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } } } },
          },
        },
      },
    },
    '/api/v1/attendance/corrections': {
      get: {
        tags: ['Attendance'],
        summary: 'List correction requests',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
          { name: 'employeeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Paginated correction list',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Correction' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Attendance'],
        summary: 'Submit correction request',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitCorrectionRequest' } } },
        },
        responses: {
          '201': { description: 'Correction submitted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Correction' } } } },
          '404': { description: 'Attendance record not found' },
        },
      },
    },
    '/api/v1/attendance/corrections/{id}/review': {
      post: {
        tags: ['Attendance'],
        summary: 'Review correction request',
        description: 'Manager/Admin approves or rejects a correction. Approved corrections update the attendance record.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewCorrectionRequest' } } },
        },
        responses: {
          '200': { description: 'Correction reviewed' },
          '404': { description: 'Not found' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  LEAVE
    // ════════════════════════════════════════════
    '/api/v1/leave/types': {
      get: {
        tags: ['Leave'],
        summary: 'List leave types',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated leave types',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/LeaveType' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Leave'],
        summary: 'Create leave type',
        description: 'Admin only. Defines a new leave category (e.g. Annual, Sick).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string' },
                  days_per_year: { type: 'integer', minimum: 0, maximum: 365 },
                  accrual_policy: { type: 'object' },
                  carry_over_max_days: { type: 'integer', minimum: 0, maximum: 365 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Leave type created', content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveType' } } } },
        },
      },
    },
    '/api/v1/leave/types/{id}': {
      put: {
        tags: ['Leave'],
        summary: 'Update leave type',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string', nullable: true },
                  days_per_year: { type: 'integer' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Leave type updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveType' } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/leave/balance': {
      get: {
        tags: ['Leave'],
        summary: 'Get leave balance',
        description: 'Returns the leave balance for the current user or a specific employee (admin).',
        parameters: [
          { name: 'employeeId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Optional — admin can query any employee' },
        ],
        responses: {
          '200': {
            description: 'Leave balances',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LeaveBalance' } } } },
          },
        },
      },
    },
    '/api/v1/leave/requests': {
      get: {
        tags: ['Leave'],
        summary: 'List leave requests',
        description: 'Employees see only their own. Managers/Admins see all.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
          { name: 'employeeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Paginated leave requests',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/LeaveRequest' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Leave'],
        summary: 'Create leave request',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateLeaveRequest' } } },
        },
        responses: {
          '201': { description: 'Leave request created', content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveRequest' } } } },
          '409': { description: 'Overlapping leave' },
        },
      },
    },
    '/api/v1/leave/requests/{id}/approve': {
      post: {
        tags: ['Leave'],
        summary: 'Approve leave request',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { notes: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'Leave approved', content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveRequest' } } } },
          '400': { description: 'Request is not PENDING' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/leave/requests/{id}/reject': {
      post: {
        tags: ['Leave'],
        summary: 'Reject leave request',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['reason'], properties: { reason: { type: 'string', minLength: 1 } } } } },
        },
        responses: {
          '200': { description: 'Leave rejected' },
          '400': { description: 'Request is not PENDING' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/leave/requests/bulk-approve': {
      post: {
        tags: ['Leave'],
        summary: 'Bulk approve leave requests',
        description: 'Admin only. Approves multiple pending requests at once.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkApproveRequest' } } },
        },
        responses: {
          '200': {
            description: 'Bulk approval result',
            content: { 'application/json': { schema: { type: 'object', properties: { approved: { type: 'integer' } } } } },
          },
        },
      },
    },
    '/api/v1/leave/approvers/delegate': {
      get: {
        tags: ['Leave'],
        summary: 'List leave delegates',
        description: 'Returns delegates for the current manager.',
        responses: {
          '200': {
            description: 'Delegate list',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Delegate' } } } },
          },
        },
      },
      post: {
        tags: ['Leave'],
        summary: 'Create leave delegate',
        description: 'Assign a delegate to handle leave approvals while the manager is away.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDelegateRequest' } } },
        },
        responses: {
          '201': { description: 'Delegate created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Delegate' } } } },
        },
      },
    },
    '/api/v1/leave/approvers/delegate/{id}': {
      delete: {
        tags: ['Leave'],
        summary: 'Remove leave delegate',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'Delegate removed' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  NOTIFICATIONS
    // ════════════════════════════════════════════
    '/api/v1/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated notifications',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } }] } } },
          },
        },
      },
    },
    '/api/v1/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'Marked as read' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/v1/notifications/read-all': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        responses: {
          '204': { description: 'All marked as read' },
        },
      },
    },
    '/api/v1/notifications/preferences': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notification preferences',
        responses: {
          '200': {
            description: 'Preference list',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/NotificationPreference' } } } },
          },
        },
      },
      put: {
        tags: ['Notifications'],
        summary: 'Update notification preferences',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  preferences: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['type', 'channel', 'enabled'],
                      properties: {
                        type: { type: 'string' },
                        channel: { type: 'string' },
                        enabled: { type: 'boolean' },
                        preference: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Preferences updated' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  ANALYTICS
    // ════════════════════════════════════════════
    '/api/v1/analytics/dashboard': {
      get: {
        tags: ['Analytics'],
        summary: 'Dashboard metrics',
        description: 'Returns today\'s key metrics: total employees, present, late, absent, on leave, attendance rate, avg hours, overtime.',
        parameters: [
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Dashboard data', content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardMetrics' } } } },
        },
      },
    },
    '/api/v1/analytics/attendance': {
      get: {
        tags: ['Analytics'],
        summary: 'Attendance trend',
        description: 'Daily attendance rate over the last N days.',
        parameters: [
          { name: 'days', in: 'query', schema: { type: 'integer', default: 30 } },
        ],
        responses: {
          '200': {
            description: 'Trend data',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/AttendanceTrend' } } } },
          },
        },
      },
    },
    '/api/v1/analytics/late-arrivals': {
      get: {
        tags: ['Analytics'],
        summary: 'Late arrival trend',
        description: 'Daily late-arrival count over the last N days.',
        parameters: [
          { name: 'days', in: 'query', schema: { type: 'integer', default: 30 } },
        ],
        responses: {
          '200': {
            description: 'Trend data',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LateArrivalTrend' } } } },
          },
        },
      },
    },
    '/api/v1/analytics/work-hours': {
      get: {
        tags: ['Analytics'],
        summary: 'Work hours summary',
        description: 'Average hours per employee over the last N days.',
        parameters: [
          { name: 'days', in: 'query', schema: { type: 'integer', default: 30 } },
        ],
        responses: {
          '200': {
            description: 'Per-employee work hours',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/WorkHoursSummary' } } } },
          },
        },
      },
    },
    '/api/v1/analytics/departments': {
      get: {
        tags: ['Analytics'],
        summary: 'Department comparison',
        description: 'Attendance rate per department over the last 30 days.',
        responses: {
          '200': {
            description: 'Department metrics',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/DepartmentComparison' } } } },
          },
        },
      },
    },
    '/api/v1/analytics/anomalies': {
      get: {
        tags: ['Analytics'],
        summary: 'Attendance anomalies',
        description: 'Detects chronic lateness (>=5), frequent absence (>=4), and high correction rate (>=3) in the last 30 days.',
        responses: {
          '200': {
            description: 'Detected anomalies',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Anomaly' } } } },
          },
        },
      },
    },
    '/api/v1/analytics/benchmark': {
      get: {
        tags: ['Analytics'],
        summary: 'Benchmark (placeholder)',
        description: 'Compare department vs organization-wide metrics. Returns empty array in MVP.',
        responses: {
          '200': { description: 'Benchmark data', content: { 'application/json': { schema: { type: 'array' } } } },
        },
      },
    },
    '/api/v1/analytics/snapshots': {
      get: {
        tags: ['Analytics'],
        summary: 'List snapshots',
        description: 'Returns previously saved analytics snapshots.',
        responses: {
          '200': { description: 'Snapshot list', content: { 'application/json': { schema: { type: 'array' } } } },
        },
      },
      post: {
        tags: ['Analytics'],
        summary: 'Create snapshot',
        description: 'Save a point-in-time snapshot of key metrics.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'date_from', 'date_to'],
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 200 },
                  date_from: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
                  date_to: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Snapshot created' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  REPORTS
    // ════════════════════════════════════════════
    '/api/v1/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List generated reports',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'Paginated report list',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Report' } } } }] } } },
          },
        },
      },
      post: {
        tags: ['Reports'],
        summary: 'Generate report',
        description: 'Enqueues a background job to generate a report. Returns a report ID for polling.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateReportRequest' } } },
        },
        responses: {
          '202': {
            description: 'Report generation started',
            content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' }, status: { type: 'string', example: 'QUEUED' } } } } },
          },
        },
      },
    },
    '/api/v1/reports/{id}/download': {
      get: {
        tags: ['Reports'],
        summary: 'Download report',
        description: 'Returns the generated report file (MVP: placeholder response).',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Report file (binary)' },
          '404': { description: 'Report not ready or not found' },
        },
      },
    },

    // ════════════════════════════════════════════
    //  AUDIT
    // ════════════════════════════════════════════
    '/api/v1/audit': {
      get: {
        tags: ['Audit'],
        summary: 'List audit logs',
        description: 'Admin/SuperAdmin only. Returns a chronological audit trail.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'entity', in: 'query', schema: { type: 'string' } },
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': {
            description: 'Paginated audit logs',
            content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginatedResponse' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/AuditLog' } } } }] } } },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
