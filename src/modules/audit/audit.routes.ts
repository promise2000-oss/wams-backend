import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import { listAuditLogs } from './audit.service';

const router = Router();

router.get('/', authenticate, authorize('audit.view'), listAuditLogs);

export default router;
