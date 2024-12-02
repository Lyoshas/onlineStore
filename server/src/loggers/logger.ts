import winston from 'winston';

// визначаємо формат логування
const logFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.printf(({ timestamp, level, message }) => {
		return `${timestamp} ${level}: ${message}`;
	})
);

export const logger = winston.createLogger({
	level: 'info', // логування "info", "warn", "error"
	transports: [new winston.transports.Console({ format: logFormat })],
});
