import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
process.env.LOG_LEVEL = 'silent';
import Server from '../server/common/server';
import { random } from 'lodash';

let app, server;

const usedPorts = [];
const generatePortNumber = (): number => {
    let port: number = random(10240, 60000);
    while (usedPorts.includes(port)) {
        port = random(10240, 60000);
    }
    usedPorts.push(port);
    return port;
};

describe('Metrics', () => {
    beforeEach(async () => {
        const { default: routes } = await import('../server/routes');
        server = new Server().router(routes);
        const port = generatePortNumber();
        app = server.listen(port);
    });

    afterEach(async () => {
        await server.close();
    });

    describe('GET /metric/{key}/sum', () => {
        it('returns 404 if no metrics have been logged for the given key', () =>
            request(app)
                .get('/api/v1/metric/active_visitors/sum')
                .expect(404));

        it('returns 200 with the sum of logged metric values', async () => {
            const agent = request(app);
            await agent
                .post('/api/v1/metric/active_visitors')
                .send({ value: 50 });
            await agent
                .post('/api/v1/metric/active_visitors')
                .send({ value: 150 });
            await agent
                .post('/api/v1/metric/active_visitors')
                .send({ value: 250 });
            await agent
                .post('/api/v1/metric/active_visitors')
                .send({ value: 350 });
            const result = await agent
                .get('/api/v1/metric/active_visitors/sum')
                .expect(200);
            return expect(result.body)
                .to.be.an('object')
                .that.has.property('value')
                .equal(800);
        });
    });

    describe('POST /metric/{key}', () => {
        it('returns 200 when provided with valid input', async () => {
            const result = await request(app)
                .post('/api/v1/metric/active_visitors')
                .send({ value: 450 })
                .expect(200)
                .expect('Content-Type', /json/);

            return expect(result.body).to.be.an('object').that.is.empty;
        });

        it('returns 400 when provided with no input', () =>
            request(app)
                .post('/api/v1/metric/active_visitors')
                .send({})
                .expect(400)
                .expect('Content-Type', /json/));

        it('returns 400 when provided with a string value', () =>
            request(app)
                .post('/api/v1/metric/active_visitors')
                .send({ value: 'twenty' })
                .expect(400)
                .expect('Content-Type', /json/));

        it('returns 400 when provided with a wrong key', () =>
            request(app)
                .post('/api/v1/metric/active_visitors')
                .send({ points: 450 })
                .expect(400)
                .expect('Content-Type', /json/));
    });
});
