import { FC, useCallback, useState } from 'react';
import classNames from 'classnames';

import classes from './ExpandableBlock.module.css';

const ExpandableBlock: FC<{
    summaryBlockClassName?: string;
    detailsBlockClassName?: string;
    expandArrowBlockClassName?: string;
    SummaryContent: JSX.Element;
    DetailsContent: JSX.Element;
}> = (props) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const toggleExpandedStatus = useCallback(() => {
        setIsExpanded((prevIsExpanded) => !prevIsExpanded);
    }, [setIsExpanded]);

    return (
        <div className={classes['expandable-block']}>
            <div
                className={classNames(
                    classes['expandable-block__summary'],
                    props.summaryBlockClassName
                )}
                onClick={toggleExpandedStatus}
            >
                {props.SummaryContent}
                <div
                    className={classNames(
                        classes['order-item__expand-block'],
                        props.expandArrowBlockClassName
                    )}
                >
                    <img
                        className={classNames(
                            isExpanded && classes['expand-block__item_rotated']
                        )}
                        src="https://onlinestore-react-assets.s3.eu-north-1.amazonaws.com/expand-arrow.svg"
                        alt="expand-arrow"
                    />
                </div>
            </div>
            <div
                className={classNames(
                    classes['expandable-block__details'],
                    !isExpanded && classes['hidden'],
                    props.detailsBlockClassName
                )}
            >
                {props.DetailsContent}
            </div>
        </div>
    );
};

export default ExpandableBlock;
