import React, { FC } from 'react';
import SuccessIcon from '../Icons/SuccessIcon';
import classNames from 'classnames';

import classes from './SuccessMessageBlock.module.css';
import CenterBlock from '../CenterBlock/CenterBlock';

const SuccessMessageBlock: FC<{
    content: React.ReactNode;
    className?: string;
}> = (props) => {
    return (
        <CenterBlock
            className={classNames(classes['success-block'], props.className)}
        >
            <SuccessIcon className="icon" />
            {props.content}
        </CenterBlock>
    );
};

export default SuccessMessageBlock;
