import SnakeCase from './SnakeCase.js';

type SnakeCaseProperties<T> = {
    [K in keyof T as SnakeCase<string & K>]: T[K];
}

export default SnakeCaseProperties;
