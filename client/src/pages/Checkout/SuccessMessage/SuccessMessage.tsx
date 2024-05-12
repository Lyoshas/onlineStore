import { FC, Fragment } from 'react';

import SuccessMessageBlock from '../../../components/UI/SuccessMessageBlock/SuccessMessageBlock';
import ButtonLink from '../../../components/UI/ButtonLink/ButtonLink';

const SuccessMessage: FC<{
    showEmailNotice: boolean;
    mode: 'OrderCreated' | 'PaymentProcessed';
}> = (props) => {
    return (
        <SuccessMessageBlock
            content={
                <Fragment>
                    <p>
                        {props.mode === 'OrderCreated'
                            ? 'Замовлення було успішно створено.'
                            : 'Ваш платіж був успішно оброблений.'}
                        <br />
                        Будь ласка, очікуйте дзвінка від менеджера.
                    </p>
                    {props.showEmailNotice && (
                        <p>
                            Оскільки замовлення було зроблено без
                            автентифікації, ми надіслали вам на електронну пошту
                            дані для входу до вашого новоствореного облікового
                            запису. Лист було надіслано на адресу, яку ви
                            вказали під час оформлення замовлення.
                        </p>
                    )}
                    {!props.showEmailNotice ? (
                        <ButtonLink to="/user/orders">
                            Відстеження замовлення
                        </ButtonLink>
                    ) : (
                        <ButtonLink to="/auth/sign-in">
                            Увійти в акаунт
                        </ButtonLink>
                    )}
                </Fragment>
            }
        />
    );
};

export default SuccessMessage;
