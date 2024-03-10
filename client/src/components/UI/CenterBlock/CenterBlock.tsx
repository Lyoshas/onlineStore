import { FC } from 'react';
import classnames from 'classnames';

import classes from './CenterBlock.module.css';
import Card from '../Card/Card';

const CenterBlock: FC<{
    children: React.ReactNode;
    className?: string;
    whiteBackground?: boolean;
}> = ({ whiteBackground = true, ...props }) => {
    return (
        <div className="flex-wrapper">
            <Card
                className={classnames(
                    classes['center-block'],
                    whiteBackground && classes['white-background'],
                    props.className
                )}
            >
                {props.children}
            </Card>
        </div>
    );
};

export default CenterBlock;
