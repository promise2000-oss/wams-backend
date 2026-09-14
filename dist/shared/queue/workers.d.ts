import { Worker } from 'bullmq';
declare const notificationWorker: Worker<any, any, string>;
declare const autoAbsentWorker: Worker<any, any, string>;
declare const analyticsWorker: Worker<any, any, string>;
declare const leaveAccrualWorker: Worker<any, any, string>;
declare const reportsWorker: Worker<any, any, string>;
declare const escalationWorker: Worker<any, any, string>;
export { notificationWorker, autoAbsentWorker, analyticsWorker, leaveAccrualWorker, reportsWorker, escalationWorker, };
//# sourceMappingURL=workers.d.ts.map