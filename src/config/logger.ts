import pino from 'pino';

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        }
    },
    level: process.env.LOG_LEVEL || 'info',
    base: {
        env: process.env.NODE_ENV || 'development',
    }
});

export default logger;
