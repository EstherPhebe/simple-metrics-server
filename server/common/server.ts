import express, { Application } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import os from 'os';
import cookieParser from 'cookie-parser';
import logger from './logger';

import installValidator from './openapi';

const app = express();
const exit = process.exit;

export default class ExpressServer {
    private routes: (app: Application) => void;
    private server;
    constructor() {
        const root = path.normalize(__dirname + '/../..');
        app.set('appPath', root + 'client');
        app.use(
            bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' })
        );
        app.use(
            bodyParser.urlencoded({
                extended: true,
                limit: process.env.REQUEST_LIMIT || '100kb',
            })
        );
        app.use(
            bodyParser.text({ limit: process.env.REQUEST_LIMIT || '100kb' })
        );
        app.use(cookieParser(process.env.SESSION_SECRET));
        app.use(express.static(`${root}/public`));
    }

    router(routes: (app: Application) => void): ExpressServer {
        this.routes = routes;
        return this;
    }

    listen(port: number): Application {
        const welcome = (p: number) => (): void =>
            logger.info(
                `up and running in ${
                    process.env.NODE_ENV || 'development'
                } @: ${os.hostname()} on port: ${p}}`
            );

        installValidator(app, this.routes)
            .then(() => {
                this.server = http
                    .createServer(app)
                    .listen(port, welcome(port));
            })
            .catch((err) => {
                logger.error(err);
                exit(1);
            });

        return app;
    }

    close(): Promise<void> {
        return new Promise((resolve) => {
            this.server.close(resolve);
        });
    }
}
