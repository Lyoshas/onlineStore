import DBProduct from '../../interfaces/DBProduct';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties';

export function randomInteger(min: number, max: number): number {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

export function randomString(length: number): string {
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    letters += letters.toUpperCase();
    const lettersLength = letters.length;

    let randomString = '';

    for (let i = 0; i < length; i++) {
        randomString += letters[randomInteger(0, lettersLength - 1)];
    }

    return randomString;
}

// Example: 1.2345, where 12345 is the mantissa and 10^-4 is the exponent
// so in the example above mentissaLength = 5, exponentLength = 4
export function randomFloat(
    mantissaLength: number,
    exponentLength: number
): number {
    let mantissa = '';

    for (let i = 0; i < mantissaLength; i++) {
        mantissa += randomInteger(1, 9);
    }

    return +(+mantissa * 10 ** -exponentLength).toFixed(exponentLength);
}

export function randomProductInfo(): Omit<
    CamelCaseProperties<DBProduct>,
    'id'
> {
    return {
        title: randomString(25),
        price: randomFloat(randomInteger(1, 7), 2),
        initialImageUrl: `http://${randomString(50)}`,
        additionalImageUrl: `http://${randomString(50)}`,
        quantityInStock: randomInteger(1, 50),
        shortDescription: randomString(50),
    };
}
