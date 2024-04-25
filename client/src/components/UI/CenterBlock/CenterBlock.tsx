import { FC } from 'react';
import classnames from 'classnames';

import classes from './CenterBlock.module.css';

const CenterBlock: FC<{
    children: React.ReactNode;
    className?: string;
    whiteBackground?: boolean;
}> = ({ whiteBackground = true, ...props }) => {
    return (
        <div className="flex-wrapper">
            <div
                className={classnames(
                    classes['center-block'],
                    whiteBackground && classes['white-background'],
                    props.className
                )}
            >
                {props.children}
            </div>
        </div>
    );
};

export default CenterBlock;
