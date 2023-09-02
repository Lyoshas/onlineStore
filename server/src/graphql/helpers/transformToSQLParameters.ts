import camelCaseToSnakeCase from './camelCaseToSnakeCase.js';
import AnyObject from '../../interfaces/AnyObject.js';

// Example:
// transformToSQLObject({ firstKey: 'val1', secondKey: 'val2' }) -> { first_key: 'val1', second_key: 'val2' }
const transformToSQLParameters = (object: AnyObject) => {
    const result: AnyObject = {};

    for (let [key, value] of Object.entries(object)) {
        result[camelCaseToSnakeCase(key)] = value;
    }

    return result;
};

export default transformToSQLParameters;
