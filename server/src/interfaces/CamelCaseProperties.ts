import CamelCase from './CamelCase';

type CamelCaseProperties<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K];
};

export default CamelCaseProperties;
