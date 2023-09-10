type SnakeCase<T extends string, P extends string = ''> = string extends T
    ? string
    : T extends `${infer C0}${infer R}`
    ? SnakeCase<R, `${P}${C0 extends Lowercase<C0> ? '' : '_'}${Lowercase<C0>}`>
    : P;

export default SnakeCase;
