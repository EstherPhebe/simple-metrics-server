import { Application } from 'express';
import metricsRouter from './api/controllers/metrics/router';
export default function routes(app: Application): void {
    app.use('/api/v1/metric', metricsRouter);
}
