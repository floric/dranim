import { createLogger, format, Logger, transports } from 'winston';

const logFormat = format.printf(
  info => `${info.timestamp} ${info.level}: ${info.message}`
);

export const Log: Logger = createLogger({
  level: 'verbose',
  format: format.json(),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
    new transports.Console({
      format: format.combine(format.timestamp(), logFormat),
      level: process.env.NODE_ENV !== 'production' ? 'verbose' : 'info'
    })
  ]
});

export class MorganLogStream {
  public write(text: string) {
    Log.verbose(text.trim());
  }
}
