import { FC } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import classes from './PaginationItem.module.css';

interface PaginationItemProps {
    page: number;
    isCurrentPage?: boolean;
}

const PaginationItem: FC<PaginationItemProps> = ({
    page,
    isCurrentPage = false,
}) => {
    return (
        <li
            className={classNames(
                classes['product-pagination-ul__item'],
                isCurrentPage && classes['product-pagination-ul__item_current']
            )}
        >
            <Link
                to={`?page=${page}`}
                className={classes['product-pagination-item__link']}
            >
                {page}
            </Link>
        </li>
    );
};

export default PaginationItem;
