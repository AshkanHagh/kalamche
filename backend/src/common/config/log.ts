import * as winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      format: winston.format.json(),
      lazy: true,
    }),

    new winston.transports.Console({
      level: "error",
      format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.timestamp(),
      ),
    }),
  ],
});
