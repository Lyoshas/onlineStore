import { createHash } from 'crypto';

import LiqpayDecodedData from '../interfaces/LiqpayDecodedData.js';
import CamelCaseProperties from '../interfaces/CamelCaseProperties.js';
import camelCaseObject from '../util/camelCaseObject.js';
import { base64Decode } from '../util/base64.js';

export const createLiqPayFormData = (args: {
    action: LiqpayDecodedData['action'];
    amount: number;
    description: string;
    orderId: number;
    resultUrl: string;
}): { data: string; signature: string } => {
    const { action, amount, description, orderId, resultUrl } = args;

    const data = Buffer.from(
        JSON.stringify({
            version: 3,
            public_key: process.env.LIQPAY_PUBLIC_KEY,
            action,
            amount,
            currency: 'UAH',
            description,
            order_id: orderId,
            result_url: resultUrl,
        })
    ).toString('base64');

    return {
        data,
        signature: createLiqPaySignature(data),
    };
};

export const createLiqPaySignature = (data: string): string => {
    const privateKey: string = process.env.LIQPAY_PRIVATE_KEY!;
    return createHash('sha1')
        .update(privateKey + data + privateKey)
        .digest('base64');
};

export const decodeLiqPayData = (
    encodedBase64Data: string
): CamelCaseProperties<LiqpayDecodedData> => {
    return camelCaseObject(
        JSON.parse(base64Decode(encodedBase64Data)) as LiqpayDecodedData
    );
};
