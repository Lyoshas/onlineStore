import { FC, Fragment } from 'react';
import classNames from 'classnames';

import classes from './AuthButton.module.css';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import Button from '../UI/Button/Button';

interface AuthButtonProps {
    textContent: string;
    // this component will create an image out of 'providerImageURL'
    providerImageURL: string;
    // when the user clicks on this button, they will be redirected to the "redirectTo" URL
    // if 'redirectTo' is not provided, this component is assumed to be a simple button, not a link
    redirectTo?: string;
    className?: string;
    // onClick is only applicable if 'redirectTo' is NOT specifed, meaning if this component is a button
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const AuthButton: FC<AuthButtonProps> = (props) => {
    const className = classNames(
        classes['auth-button'],
        classes.flex,
        props.className
    );

    const ButtonData = (
        <Fragment>
            <img
                src={props.providerImageURL}
                className={classes['auth-button__provider-img']}
                alt="Auth"
            />
            <span>{props.textContent}</span>
        </Fragment>
    );

    return props.redirectTo ? (
        <ButtonLink to={props.redirectTo} className={className}>
            {ButtonData}
        </ButtonLink>
    ) : (
        <Button className={className} onClick={props.onClick}>
            {ButtonData}
        </Button>
    );
};

export default AuthButton;
