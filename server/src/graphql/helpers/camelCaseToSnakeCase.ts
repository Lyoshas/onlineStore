import SnakeCase from '../../interfaces/SnakeCase';

// For example:
// camelCaseToSnakeCase('myNewStringIsCool') -> 'my_new_string_is_cool'
const camelCaseToSnakeCase = <T extends string = string>(
    str: T
): SnakeCase<T> => {
    return str.replace(/([A-Z])/g, (match: string) => {
        return `_${match.toLowerCase()}`;
    }) as SnakeCase<T>;
};

export default camelCaseToSnakeCase;
