import Winston, { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

class Logger {

  protected logger: Winston.Logger;
  private static instance: Logger;

  private constructor() {
    this.logger = createLogger({
      transports: [
        new transports.Console({
          format: combine(
            label({ label: 'MQTT' }),
            printf(({ level, message, label }) => {
              return `[${label}] ${level}: ${message}`;
            })),
          level: 'debug'
        }),
        new transports.File({
          format: combine(
            timestamp(),
            printf(({ level, message, label, timestamp }) => {
              return `${timestamp} ${level}: ${message}`;
            })),
          filename: 'logs/combined.log',
          level: 'info'
        })
      ]
    });
  }

  public static get GetLogger(): Winston.Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance.logger;
  }

}

export const log = Logger.GetLogger