import { FC, useCallback } from 'react';
import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';

import classes from './PaginationItem.module.css';

interface PaginationItemProps {
    page: number;
    isCurrentPage?: boolean;
}

const PaginationItem: FC<PaginationItemProps> = ({
    page,
    isCurrentPage = false,
}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const pageChangeHandler = useCallback(() => {
        setSearchParams((prevSearchParams) => {
            prevSearchParams.set('page', String(page));
            return prevSearchParams;
        });
    }, [setSearchParams, page]);

    return (
        <li
            className={classNames(
                classes['product-pagination-ul__item'],
                isCurrentPage && classes['product-pagination-ul__item_current']
            )}
        >
            <span
                className={classes['product-pagination-item__link']}
                onClick={pageChangeHandler}
            >
                {page}
            </span>
        </li>
    );
};

export default PaginationItem;
