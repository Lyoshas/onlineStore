import CamelCaseProperties from '../interfaces/CamelCaseProperties.js';
import snakeCaseToCamelCase from './snakeCaseToCamelCase.js';

const camelCaseObject = <T extends object>(
    inputObject: T
): CamelCaseProperties<T> => {
    const result = {} as CamelCaseProperties<T>;

    for (let [key, value] of Object.entries(inputObject)) {
        result[snakeCaseToCamelCase(key) as keyof CamelCaseProperties<T>] =
            value;
    }

    return result;
};

export default camelCaseObject;
