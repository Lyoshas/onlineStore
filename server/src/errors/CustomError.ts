import ApplicationError from '../interfaces/ApplicationError.js';

export default abstract class CustomError extends Error {
    abstract statusCode: number;

    abstract serializeErrors(): ApplicationError[];
}
