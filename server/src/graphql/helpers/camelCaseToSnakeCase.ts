// For example:
// camelCaseToSnakeCase('myNewStringIsCool') -> 'my_new_string_is_cool'
const camelCaseToSnakeCase = (str: string) => {
    return str.replace(/([A-Z])/g, (match: string) => {
        return `_${match.toLowerCase()}`;
    })
};

export default camelCaseToSnakeCase;
