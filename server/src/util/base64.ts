export const base64Decode = (base64Encoded: string): string => {
    return Buffer.from(base64Encoded, 'base64').toString('utf-8');
};

export const base64Encode = (data: string): string => {
    return Buffer.from(data, 'utf-8').toString('base64');
};
