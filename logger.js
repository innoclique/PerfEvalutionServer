
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });
const logger = createLogger({
    level: 'info',
    
    format: combine(
        label({ label: 'right meow!' }),
        format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
      myFormat
    ),
    defaultMeta: { service: 'OPAssess' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `quick-start-combined.log`.
      // - Write all logs error (and below) to `quick-start-error.log`.
      //
      new transports.File({ filename: 'logs\\error.log', level: 'error' }),
      new transports.File({ filename: 'logs\\allLogs.log' })
    ]
  });

  //winston.add(logger);
  module.exports=logger;