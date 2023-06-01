import { FC } from 'react';

import CenterBlock from '../../UI/CenterBlock/CenterBlock';
import ErrorIcon from '../../UI/Icons/ErrorIcon';
import ButtonLink from '../../UI/ButtonLink/ButtonLink';
import classes from './ErrorMessage.module.css';

const ErrorMessage: FC<{ message: string }> = ({ message }) => {
    // props.message will be split by '\n'.
    // This way, it would be possible to add multiple paragraphs to this component
    const splitMessage = message.split('\n');

    return (
        <CenterBlock className={classes['edit-product-error']}>
            <ErrorIcon className="icon" />
            {splitMessage.map((message, i) => (
                <p key={i}>{message}</p>
            ))}
            <ButtonLink to="/">Home</ButtonLink>
        </CenterBlock>
    );
};

export default ErrorMessage;
