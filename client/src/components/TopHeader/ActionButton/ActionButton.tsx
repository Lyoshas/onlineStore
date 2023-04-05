import { FC, Fragment } from 'react';

import Button from '../../UI/Button/Button';
import classes from './ActionButton.module.css';
import ButtonLink from '../../UI/ButtonLink/ButtonLink';
import Image from '../Image/Image';

interface ActionButtonProps {
    // if props.to is specified, <ButtonLink /> is used, otherwise <Button />
    to?: string;
    // an image that will be shown in front of the text
    imageURL: string;
    imageAlt: string;
    // text that will be shown in front of the image
    content: React.ReactNode;
    // onClick will be ignored if props.to is specified
    onClick?: () => void;
}

const ActionButton: FC<ActionButtonProps> = (props) => {
    const classname = classes['action-button'];
    const content = (
        <Fragment>
            <Image src={props.imageURL} alt={props.imageAlt} />
            {props.content}
        </Fragment>
    );

    return props.to ? (
        <ButtonLink to={props.to} className={classname}>
            {content}
        </ButtonLink>
    ) : (
        <Button onClick={props.onClick} className={classname}>
            {content}
        </Button>
    );
};

export default ActionButton;
