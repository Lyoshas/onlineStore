import { FC } from 'react';
import classnames from 'classnames';

import classes from './CenterBlock.module.css';
import Card from '../Card/Card';

const CenterBlock: FC<{ children: React.ReactNode; className?: string }> = (
    props
) => {
    return (
        <div className="flex-wrapper">
            <Card
                className={classnames(classes['center-block'], props.className)}
            >
                {props.children}
            </Card>
        </div>
    );
};

export default CenterBlock;
