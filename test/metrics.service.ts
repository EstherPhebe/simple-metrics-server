import 'mocha';
import { expect } from 'chai';
import { MetricsService } from '../server/api/services/metrics.service';
import { DateTime } from 'luxon';

let metricsService;

describe('MetricsService', () => {
    beforeEach(() => {
        metricsService = new MetricsService();
    });

    describe('loadRaw', () => {
        it('returns an array of newly added metrics on success', async () => {
            const rawMetrics = [
                {
                    key: 'active_visitors',
                    value: 400,
                    timestamp: new Date(),
                },
            ];
            const metrics = await metricsService.loadRaw(rawMetrics);

            expect(metrics)
                .to.be.an('array')
                .lengthOf(1)
                .deep.equals(rawMetrics);
        });
    });

    describe('all', () => {
        it('returns an empty collection on initialization', async () => {
            const metrics = await metricsService.all();

            expect(metrics).to.be.an('array').that.is.empty;
        });
    });

    describe('create', () => {
        it('return a metric on creation', async () => {
            const metric = await metricsService.create('active_visitors', 50);

            expect(metric).to.be.an('object');
            expect(metric).to.have.property('key', 'active_visitors');
            expect(metric).to.have.property('value', 50);
            expect(metric).to.have.property('timestamp');
            expect(metric.timestamp).to.be.a('date');
        });
    });

    describe('byKey', () => {
        it('returns metric for the specified key only', async () => {
            await metricsService.create('active_visitors', 50);
            await metricsService.create('inactive_visitors', 150);

            const metrics = await metricsService.byKey('active_visitors');

            expect(metrics).to.be.an('array');
            expect(metrics).to.have.lengthOf(1);
            expect(metrics[0]).to.have.property('key', 'active_visitors');
            expect(metrics[0]).to.have.property('value', 50);
            expect(metrics[0]).to.have.property('timestamp');
            expect(metrics[0].timestamp).to.be.a('date');
        });

        it('returns metrics no older than a specified time', async () => {
            const now = new Date();
            const thirtyMinutesAgo: Date = DateTime.fromJSDate(now)
                .minus({
                    minutes: 30,
                })
                .toJSDate();
            const oneHourAgo: Date = DateTime.fromJSDate(now)
                .minus({
                    hours: 1,
                })
                .toJSDate();
            const twoHoursAgo: Date = DateTime.fromJSDate(now)
                .minus({
                    hours: 2,
                })
                .toJSDate();

            await metricsService.loadRaw([
                { key: 'active_visitors', value: 50, timestamp: twoHoursAgo },
                { key: 'active_visitors', value: 150, timestamp: oneHourAgo },
                {
                    key: 'active_visitors',
                    value: 250,
                    timestamp: thirtyMinutesAgo,
                },
                { key: 'active_visitors', value: 350, timestamp: now },
            ]);

            const metrics = await metricsService.byKey(
                'active_visitors',
                Number(oneHourAgo)
            );

            expect(metrics)
                .to.be.an('array')
                .lengthOf(3);
        });
    });
});
