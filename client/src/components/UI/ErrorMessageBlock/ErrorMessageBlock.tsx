import React, { FC } from 'react';
import classNames from 'classnames';

import CenterBlock from '../CenterBlock/CenterBlock';
import ErrorIcon from '../Icons/ErrorIcon';
import classes from './ErrorMessageBlock.module.css';
import ButtonLink from '../ButtonLink/ButtonLink';

const ErrorMessageBlock: FC<{
    message: string;
    buttonLinks?: React.ReactNode;
    whiteBackground?: boolean;
}> = ({ message, buttonLinks, whiteBackground = true }) => {
    return (
        <CenterBlock
            className={classNames(
                classes['error-message-block'],
                classes[whiteBackground ? 'black-font' : 'white-font']
            )}
            whiteBackground={whiteBackground}
        >
            <ErrorIcon className="icon" />
            <p>{message}</p>
            {buttonLinks ? (
                buttonLinks
            ) : (
                <ButtonLink to="/">На головну</ButtonLink>
            )}
        </CenterBlock>
    );
};

export default ErrorMessageBlock;