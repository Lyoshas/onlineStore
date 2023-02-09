import ApplicationError from '../interfaces/ApplicationError';

export default abstract class CustomError extends Error {
    abstract statusCode: number;

    abstract serializeErrors(): ApplicationError[];
}
