declare const swaggerSpec: {
    openapi: string;
    info: {
        title: string;
        description: string;
        version: string;
        contact: {
            name: string;
        };
        license: {
            name: string;
        };
    };
    servers: {
        url: string;
        description: string;
    }[];
    tags: {
        name: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
                description: string;
            };
        };
        schemas: {
            ErrorResponse: {
                type: string;
                properties: {
                    error: {
                        type: string;
                        properties: {
                            code: {
                                type: string;
                                example: string;
                            };
                            message: {
                                type: string;
                                example: string;
                            };
                            requestId: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                };
            };
            PaginationMeta: {
                type: string;
                properties: {
                    page: {
                        type: string;
                        example: number;
                    };
                    pageSize: {
                        type: string;
                        example: number;
                    };
                    total: {
                        type: string;
                        example: number;
                    };
                    totalPages: {
                        type: string;
                        example: number;
                    };
                };
            };
            PaginatedResponse: {
                type: string;
                properties: {
                    data: {
                        type: string;
                        items: {};
                    };
                    meta: {
                        $ref: string;
                    };
                };
            };
            LoginRequest: {
                type: string;
                required: string[];
                properties: {
                    email: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    password: {
                        type: string;
                        minLength: number;
                        example: string;
                    };
                };
            };
            LoginResponse: {
                type: string;
                properties: {
                    user: {
                        $ref: string;
                    };
                    accessToken: {
                        type: string;
                        description: string;
                    };
                };
            };
            RegisterRequest: {
                type: string;
                required: string[];
                properties: {
                    name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        example: string;
                    };
                    email: {
                        type: string;
                        format: string;
                        example: string;
                    };
                    password: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    organizationName: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        example: string;
                    };
                    timezone: {
                        type: string;
                        example: string;
                    };
                };
            };
            User: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organizationId: {
                        type: string;
                        format: string;
                    };
                    email: {
                        type: string;
                        format: string;
                    };
                    name: {
                        type: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    departmentId: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    managerId: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    shiftId: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    position: {
                        type: string;
                        nullable: boolean;
                    };
                    phone: {
                        type: string;
                        nullable: boolean;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                    updated_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            ChangePasswordRequest: {
                type: string;
                required: string[];
                properties: {
                    currentPassword: {
                        type: string;
                        minLength: number;
                    };
                    newPassword: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                };
            };
            CreateEmployeeRequest: {
                type: string;
                required: string[];
                properties: {
                    name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    email: {
                        type: string;
                        format: string;
                    };
                    password: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    role: {
                        type: string;
                        enum: string[];
                    };
                    phone: {
                        type: string;
                    };
                    departmentId: {
                        type: string;
                        format: string;
                    };
                    managerId: {
                        type: string;
                        format: string;
                    };
                    shiftId: {
                        type: string;
                        format: string;
                    };
                    position: {
                        type: string;
                    };
                };
            };
            UpdateEmployeeRequest: {
                type: string;
                properties: {
                    name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    email: {
                        type: string;
                        format: string;
                    };
                    role: {
                        type: string;
                        enum: string[];
                    };
                    phone: {
                        type: string;
                        nullable: boolean;
                    };
                    departmentId: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    managerId: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    shiftId: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    position: {
                        type: string;
                        nullable: boolean;
                    };
                };
            };
            Department: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    name: {
                        type: string;
                    };
                    description: {
                        type: string;
                        nullable: boolean;
                    };
                    manager_id: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    employee_count: {
                        type: string;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                    updated_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateDepartmentRequest: {
                type: string;
                required: string[];
                properties: {
                    name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    description: {
                        type: string;
                    };
                    managerId: {
                        type: string;
                        format: string;
                    };
                };
            };
            Shift: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    name: {
                        type: string;
                    };
                    start_time: {
                        type: string;
                        example: string;
                    };
                    end_time: {
                        type: string;
                        example: string;
                    };
                    grace_period_minutes: {
                        type: string;
                    };
                    break_duration_minutes: {
                        type: string;
                    };
                    working_days: {
                        type: string;
                        items: {
                            type: string;
                        };
                        example: number[];
                    };
                    overtime_rules: {
                        type: string;
                        nullable: boolean;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    employee_count: {
                        type: string;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                    updated_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateShiftRequest: {
                type: string;
                required: string[];
                properties: {
                    name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    start_time: {
                        type: string;
                        pattern: string;
                        example: string;
                    };
                    end_time: {
                        type: string;
                        pattern: string;
                        example: string;
                    };
                    grace_period_minutes: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    break_duration_minutes: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    working_days: {
                        type: string;
                        items: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        example: number[];
                    };
                    overtime_rules: {
                        type: string;
                        properties: {
                            max_overtime_minutes: {
                                type: string;
                                minimum: number;
                            };
                            rate_multiplier: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                };
            };
            ShiftAssignment: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    shift_id: {
                        type: string;
                        format: string;
                    };
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    employee_name: {
                        type: string;
                    };
                    shift_name: {
                        type: string;
                    };
                    effective_from: {
                        type: string;
                        format: string;
                    };
                    effective_to: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateAssignmentRequest: {
                type: string;
                required: string[];
                properties: {
                    shift_id: {
                        type: string;
                        format: string;
                    };
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    effective_from: {
                        type: string;
                        pattern: string;
                        example: string;
                    };
                    effective_to: {
                        type: string;
                        pattern: string;
                    };
                };
            };
            Attendance: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    employee_name: {
                        type: string;
                    };
                    shift_id: {
                        type: string;
                        format: string;
                    };
                    shift_name: {
                        type: string;
                    };
                    work_date: {
                        type: string;
                        format: string;
                    };
                    clock_in: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    clock_out: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    scheduled_start: {
                        type: string;
                        format: string;
                    };
                    scheduled_end: {
                        type: string;
                        format: string;
                    };
                    late_minutes: {
                        type: string;
                    };
                    early_departure_minutes: {
                        type: string;
                    };
                    worked_minutes: {
                        type: string;
                    };
                    overtime_minutes: {
                        type: string;
                    };
                    break_minutes: {
                        type: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    source: {
                        type: string;
                        enum: string[];
                    };
                    notes: {
                        type: string;
                        nullable: boolean;
                    };
                    department_name: {
                        type: string;
                        nullable: boolean;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                    updated_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            ClockInRequest: {
                type: string;
                properties: {
                    notes: {
                        type: string;
                    };
                };
            };
            Correction: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    attendance_id: {
                        type: string;
                        format: string;
                    };
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    employee_name: {
                        type: string;
                    };
                    work_date: {
                        type: string;
                        format: string;
                    };
                    requested_clock_in: {
                        type: string;
                        format: string;
                    };
                    requested_clock_out: {
                        type: string;
                        format: string;
                    };
                    reason: {
                        type: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    reviewed_by: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    reviewed_by_name: {
                        type: string;
                        nullable: boolean;
                    };
                    review_notes: {
                        type: string;
                        nullable: boolean;
                    };
                    reviewed_at: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            SubmitCorrectionRequest: {
                type: string;
                required: string[];
                properties: {
                    attendance_id: {
                        type: string;
                        format: string;
                    };
                    requested_clock_in: {
                        type: string;
                        format: string;
                    };
                    requested_clock_out: {
                        type: string;
                        format: string;
                    };
                    reason: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                };
            };
            ReviewCorrectionRequest: {
                type: string;
                required: string[];
                properties: {
                    status: {
                        type: string;
                        enum: string[];
                    };
                    review_notes: {
                        type: string;
                    };
                };
            };
            LeaveType: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    name: {
                        type: string;
                    };
                    description: {
                        type: string;
                        nullable: boolean;
                    };
                    days_per_year: {
                        type: string;
                    };
                    accrual_policy: {
                        type: string;
                        nullable: boolean;
                    };
                    carry_over_max_days: {
                        type: string;
                    };
                    is_active: {
                        type: string;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                    updated_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            LeaveBalance: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    leave_type_id: {
                        type: string;
                        format: string;
                    };
                    leave_type_name: {
                        type: string;
                    };
                    year: {
                        type: string;
                    };
                    total_days: {
                        type: string;
                    };
                    used_days: {
                        type: string;
                    };
                    pending_days: {
                        type: string;
                    };
                    carried_over_days: {
                        type: string;
                    };
                    accrued_days: {
                        type: string;
                    };
                    updated_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            LeaveRequest: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    employee_name: {
                        type: string;
                    };
                    leave_type_id: {
                        type: string;
                        format: string;
                    };
                    leave_type_name: {
                        type: string;
                    };
                    start_date: {
                        type: string;
                        format: string;
                    };
                    end_date: {
                        type: string;
                        format: string;
                    };
                    is_half_day: {
                        type: string;
                    };
                    half_day_period: {
                        type: string;
                        enum: string[];
                        nullable: boolean;
                    };
                    reason: {
                        type: string;
                    };
                    document_url: {
                        type: string;
                        nullable: boolean;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    approved_by: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    approved_by_name: {
                        type: string;
                        nullable: boolean;
                    };
                    rejection_reason: {
                        type: string;
                        nullable: boolean;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                    updated_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateLeaveRequest: {
                type: string;
                required: string[];
                properties: {
                    leave_type_id: {
                        type: string;
                        format: string;
                    };
                    start_date: {
                        type: string;
                        pattern: string;
                        example: string;
                    };
                    end_date: {
                        type: string;
                        pattern: string;
                        example: string;
                    };
                    is_half_day: {
                        type: string;
                    };
                    half_day_period: {
                        type: string;
                        enum: string[];
                    };
                    reason: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    document_url: {
                        type: string;
                    };
                };
            };
            Delegate: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    managerId: {
                        type: string;
                        format: string;
                    };
                    delegateId: {
                        type: string;
                        format: string;
                    };
                    startDate: {
                        type: string;
                        format: string;
                    };
                    endDate: {
                        type: string;
                        format: string;
                    };
                };
            };
            CreateDelegateRequest: {
                type: string;
                required: string[];
                properties: {
                    delegate_id: {
                        type: string;
                        format: string;
                    };
                    start_date: {
                        type: string;
                        pattern: string;
                    };
                    end_date: {
                        type: string;
                        pattern: string;
                    };
                };
            };
            BulkApproveRequest: {
                type: string;
                required: string[];
                properties: {
                    ids: {
                        type: string;
                        items: {
                            type: string;
                            format: string;
                        };
                        minItems: number;
                    };
                };
            };
            Notification: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organization_id: {
                        type: string;
                        format: string;
                    };
                    user_id: {
                        type: string;
                        format: string;
                    };
                    type: {
                        type: string;
                    };
                    title: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    data: {
                        type: string;
                        nullable: boolean;
                    };
                    delivery_channel: {
                        type: string;
                    };
                    is_read: {
                        type: string;
                    };
                    delivered_at: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            NotificationPreference: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    user_id: {
                        type: string;
                        format: string;
                    };
                    type: {
                        type: string;
                    };
                    channel: {
                        type: string;
                    };
                    enabled: {
                        type: string;
                    };
                    preference: {
                        type: string;
                    };
                };
            };
            DashboardMetrics: {
                type: string;
                properties: {
                    total_employees: {
                        type: string;
                    };
                    present: {
                        type: string;
                    };
                    late: {
                        type: string;
                    };
                    absent: {
                        type: string;
                    };
                    on_leave: {
                        type: string;
                    };
                    average_attendance_rate: {
                        type: string;
                    };
                    average_working_hours: {
                        type: string;
                    };
                    overtime_hours: {
                        type: string;
                    };
                    last_updated: {
                        type: string;
                        format: string;
                    };
                };
            };
            AttendanceTrend: {
                type: string;
                properties: {
                    date: {
                        type: string;
                        format: string;
                    };
                    rate: {
                        type: string;
                    };
                };
            };
            LateArrivalTrend: {
                type: string;
                properties: {
                    date: {
                        type: string;
                        format: string;
                    };
                    count: {
                        type: string;
                    };
                };
            };
            WorkHoursSummary: {
                type: string;
                properties: {
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    employee_name: {
                        type: string;
                    };
                    avg_hours: {
                        type: string;
                    };
                };
            };
            DepartmentComparison: {
                type: string;
                properties: {
                    department_id: {
                        type: string;
                        format: string;
                    };
                    department_name: {
                        type: string;
                    };
                    attendance_rate: {
                        type: string;
                    };
                };
            };
            Anomaly: {
                type: string;
                properties: {
                    employee_id: {
                        type: string;
                        format: string;
                    };
                    employee_name: {
                        type: string;
                    };
                    department_name: {
                        type: string;
                        nullable: boolean;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    severity: {
                        type: string;
                        enum: string[];
                    };
                    details: {
                        type: string;
                    };
                };
            };
            Report: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    type: {
                        type: string;
                    };
                    status: {
                        type: string;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            GenerateReportRequest: {
                type: string;
                required: string[];
                properties: {
                    type: {
                        type: string;
                        enum: string[];
                    };
                    filters: {
                        type: string;
                        additionalProperties: boolean;
                    };
                };
            };
            AuditLog: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        format: string;
                    };
                    organizationId: {
                        type: string;
                        format: string;
                    };
                    userId: {
                        type: string;
                        format: string;
                    };
                    action: {
                        type: string;
                    };
                    entity: {
                        type: string;
                    };
                    entityId: {
                        type: string;
                        nullable: boolean;
                    };
                    oldValues: {
                        type: string;
                        nullable: boolean;
                    };
                    newValues: {
                        type: string;
                        nullable: boolean;
                    };
                    ipAddress: {
                        type: string;
                        nullable: boolean;
                    };
                    userAgent: {
                        type: string;
                        nullable: boolean;
                    };
                    created_at: {
                        type: string;
                        format: string;
                    };
                };
            };
            HealthCheck: {
                type: string;
                properties: {
                    status: {
                        type: string;
                        enum: string[];
                    };
                    checks: {
                        type: string;
                        properties: {
                            postgres: {
                                type: string;
                                example: string;
                            };
                            redis: {
                                type: string;
                                example: string;
                            };
                        };
                    };
                    timestamp: {
                        type: string;
                        format: string;
                    };
                };
            };
        };
    };
    security: {
        bearerAuth: never[];
    }[];
    paths: {
        '/health': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                security: never[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '503': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/auth/login': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: never[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '401': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '429': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/register': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: never[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/refresh': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: never[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        accessToken: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/logout': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: never[];
                responses: {
                    '204': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/logout-all': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '204': {
                        description: string;
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/me': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/forgot-password': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                security: never[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    email: {
                                        type: string;
                                        format: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/reset-password': {
            post: {
                tags: string[];
                summary: string;
                security: never[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    token: {
                                        type: string;
                                    };
                                    password: {
                                        type: string;
                                        minLength: number;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                    '400': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/auth/change-password': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                    '401': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/employees': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                        format?: undefined;
                        enum?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                        default?: undefined;
                        enum?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        enum: string[];
                        default?: undefined;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default?: undefined;
                        format?: undefined;
                        enum?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/employees/{id}': {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
            put: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/employees/{id}/deactivate': {
            post: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/employees/{id}/reactivate': {
            post: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/departments': {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/departments/{id}': {
            put: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    name: {
                                        type: string;
                                        minLength: number;
                                        maxLength: number;
                                    };
                                    description: {
                                        type: string;
                                        nullable: boolean;
                                    };
                                    managerId: {
                                        type: string;
                                        format: string;
                                        nullable: boolean;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/shifts': {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/shifts/{id}': {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
            put: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/shifts/{id}/archive': {
            post: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/shift-assignments': {
            get: {
                tags: string[];
                summary: string;
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                        default?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/attendance/clock-in': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/attendance/clock-out': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/attendance/today': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    oneOf: ({
                                        $ref: string;
                                        type?: undefined;
                                    } | {
                                        type: string;
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/attendance/history': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                        default?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default?: undefined;
                        format?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/attendance/team-live': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/attendance/corrections': {
            get: {
                tags: string[];
                summary: string;
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                        enum?: undefined;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        enum: string[];
                        default?: undefined;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                        default?: undefined;
                        enum?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/attendance/corrections/{id}/review': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/leave/types': {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    name: {
                                        type: string;
                                        minLength: number;
                                        maxLength: number;
                                    };
                                    description: {
                                        type: string;
                                    };
                                    days_per_year: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    accrual_policy: {
                                        type: string;
                                    };
                                    carry_over_max_days: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/leave/types/{id}': {
            put: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    name: {
                                        type: string;
                                    };
                                    description: {
                                        type: string;
                                        nullable: boolean;
                                    };
                                    days_per_year: {
                                        type: string;
                                    };
                                    is_active: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/leave/balance': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                    };
                    description: string;
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/leave/requests': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                        enum?: undefined;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        enum: string[];
                        default?: undefined;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                        default?: undefined;
                        enum?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '409': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/leave/requests/{id}/approve': {
            post: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    notes: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    '400': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/leave/requests/{id}/reject': {
            post: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    reason: {
                                        type: string;
                                        minLength: number;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                    '400': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/leave/requests/bulk-approve': {
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        approved: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/leave/approvers/delegate': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/leave/approvers/delegate/{id}': {
            delete: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '204': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/notifications': {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/notifications/{id}/read': {
            post: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '204': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/notifications/read-all': {
            post: {
                tags: string[];
                summary: string;
                responses: {
                    '204': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/notifications/preferences': {
            get: {
                tags: string[];
                summary: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
            put: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                properties: {
                                    preferences: {
                                        type: string;
                                        items: {
                                            type: string;
                                            required: string[];
                                            properties: {
                                                type: {
                                                    type: string;
                                                };
                                                channel: {
                                                    type: string;
                                                };
                                                enabled: {
                                                    type: string;
                                                };
                                                preference: {
                                                    type: string;
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '200': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/analytics/dashboard': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/analytics/attendance': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/analytics/late-arrivals': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/analytics/work-hours': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/analytics/departments': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/analytics/anomalies': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/analytics/benchmark': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/analytics/snapshots': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    name: {
                                        type: string;
                                        minLength: number;
                                        maxLength: number;
                                    };
                                    date_from: {
                                        type: string;
                                        pattern: string;
                                    };
                                    date_to: {
                                        type: string;
                                        pattern: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    '201': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/reports': {
            get: {
                tags: string[];
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                description: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    '202': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        id: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            example: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/v1/reports/{id}/download': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    '200': {
                        description: string;
                    };
                    '404': {
                        description: string;
                    };
                };
            };
        };
        '/api/v1/audit': {
            get: {
                tags: string[];
                summary: string;
                description: string;
                parameters: ({
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default: number;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        default?: undefined;
                        format?: undefined;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        format: string;
                        default?: undefined;
                    };
                })[];
                responses: {
                    '200': {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                        type?: undefined;
                                        properties?: undefined;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: {
                                                    $ref: string;
                                                };
                                            };
                                        };
                                        $ref?: undefined;
                                    })[];
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export default swaggerSpec;
//# sourceMappingURL=swagger.d.ts.map