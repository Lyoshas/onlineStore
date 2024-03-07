import dbPool from '../services/postgres.service.js';

export const orderPaymentMethodExists = async (
    paymentMethodName: string
): Promise<boolean> => {
    const { rows } = await dbPool.query<{ exists: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM order_payment_methods WHERE name = $1)',
        [paymentMethodName]
    );

    return rows[0].exists;
};
