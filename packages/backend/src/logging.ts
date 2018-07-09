import * as winston from 'winston';

const format = winston.format.printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

export const Logger = winston.createLogger({
  level: 'verbose',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), format),
      level: process.env.NODE_ENV !== 'production' ? 'verbose' : 'info'
    })
  ]
});

export class MorganLogStream {
  public write(text: string) {
    Logger.verbose(text.trim());
  }
}
