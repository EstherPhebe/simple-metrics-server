import MetricsService from '../../services/metrics.service';
import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import logger from '../../../common/logger';

export class Controller {
    public async log(req: Request, res: Response): Promise<void> {
        const metric = await MetricsService.create(
            req.params.key,
            req.body.value
        );
        res.status(200).location(`/api/v1/metrics/${metric.key}/sum`).json({});
    }

    public async sumByKey(req: Request, res: Response): Promise<void> {
        const key = String(req.params.key);
        const earliestTime = DateTime.fromMillis(Date.now())
            .minus({
                hours: 1,
            })
            .toMillis();
        const metrics = await MetricsService.byKey(key, earliestTime);
        logger.info(metrics);
        if (!metrics.length) {
            return res.status(404).end();
        }
        const sum = metrics.reduce((total, { value }) => total + value, 0);
        res.json({ value: sum });
    }
}
export default new Controller();
