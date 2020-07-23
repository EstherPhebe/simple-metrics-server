import { DateTime } from 'luxon';

interface Metric {
    key: string;
    value: number;
    timestamp: Date;
}

export class MetricsService {
    metrics: Metric[] = [];

    loadRaw(metrics: Metric[]): Metric[] {
        this.metrics = [...this.metrics, ...metrics];

        return this.metrics;
    }

    all(): Promise<Metric[]> {
        return Promise.resolve(this.metrics);
    }

    async byKey(key: string, timestamp = 0): Promise<Metric[]> {
        const metrics = await this.all();
        return metrics.filter((metric) => {
            const keyMatches: boolean = metric.key === key;
            const metricTimestamp: number = DateTime.fromISO(
                metric.timestamp.toISOString()
            ).toMillis();
            const isRecent: boolean = metricTimestamp >= timestamp;

            return keyMatches && isRecent;
        });
    }

    create(key: string, value: number): Promise<Metric> {
        const metric: Metric = {
            key,
            value,
            timestamp: new Date(),
        };
        this.metrics.push(metric);
        return Promise.resolve(metric);
    }
}

export default new MetricsService();
