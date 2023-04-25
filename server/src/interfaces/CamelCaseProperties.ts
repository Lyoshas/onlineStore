type CamelCase<T extends string> = T extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}${Capitalize<CamelCase<Rest>>}`
    : `${Lowercase<T>}`;

type CamelCaseProperties<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K];
};

export default CamelCaseProperties;
