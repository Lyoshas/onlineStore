import { FC } from 'react';

import classes from './Pagination.module.css';
import PaginationItem from '../PaginationItem/PaginationItem';
import ThreeDotsItem from '../ThreeDotsItem/ThreeDotsItem';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages }) => {
    return (
        <div className={classes['product-pagination']}>
            <ul className={classes['product-pagination-ul']}>
                {currentPage !== 1 && <PaginationItem page={1} />}
                {currentPage > 4 && <ThreeDotsItem />}
                {currentPage - 2 > 1 && (
                    <PaginationItem page={currentPage - 2} />
                )}
                {currentPage - 1 > 1 && (
                    <PaginationItem page={currentPage - 1} />
                )}
                <PaginationItem page={currentPage} isCurrentPage={true} />
                {currentPage + 1 < totalPages && (
                    <PaginationItem page={currentPage + 1} />
                )}
                {currentPage + 2 < totalPages && (
                    <PaginationItem page={currentPage + 2} />
                )}
                {currentPage + 3 < totalPages && <ThreeDotsItem />}
                {currentPage !== totalPages && (
                    <PaginationItem page={totalPages} />
                )}
            </ul>
        </div>
    );
};

export default Pagination;
