import { FC } from 'react';

import CenterBlock from '../CenterBlock/CenterBlock';
import ErrorIcon from '../Icons/ErrorIcon';
import classes from './ErrorMessageBlock.module.css';
import ButtonLink from '../ButtonLink/ButtonLink';

const ErrorMessageBlock: FC<{ message: string }> = ({ message }) => {
    return (
        <CenterBlock className={classes['error-message-block']}>
            <ErrorIcon className="icon" />
            <p>{message}</p>
            <ButtonLink to="/">Home</ButtonLink>
        </CenterBlock>
    );
};

export default ErrorMessageBlock;
