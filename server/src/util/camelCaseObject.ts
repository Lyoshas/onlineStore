import AnyObject from '../interfaces/AnyObject.js';
import CamelCaseProperties from '../interfaces/CamelCaseProperties.js';
import snakeCaseToCamelCase from './snakeCaseToCamelCase.js';

// this function takes an object and transforms all keys into the "camelCase"
// format (nested objects are supported as well).
// This function accepts only objects, but the implementation of this function
// uses recursion, so "any" is used when performing recursive calls

// Example:
// camelCaseObject({ first_key: 'val1', second_key: { third_key: 'a' } }) -> { firstKey: 'val1', secondKey: { thirdKey: 'a' } }
const camelCaseObject = <T extends object>(
    input: T
): CamelCaseProperties<T> => {
    // if "input" is anything but an object or an array, return "input" immediately
    if (
        (typeof input !== 'object' && !Array.isArray(input)) ||
        input === null
    ) {
        return input;
    }

    // if we make it here, "input" is either an array or an object
    if (Array.isArray(input)) {
        return input.map((nestedValue) => camelCaseObject(nestedValue)) as any;
    } else {
        // "input" is an object
        const result: AnyObject = {};
        for (let [key, value] of Object.entries(input)) {
            result[snakeCaseToCamelCase(key)] = camelCaseObject(value);
        }
        return result as any;
    }
};

export default camelCaseObject;
