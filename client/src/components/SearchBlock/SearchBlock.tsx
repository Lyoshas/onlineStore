import React, { FC, Fragment, useCallback, useState } from 'react';
import { debounce } from 'lodash';
import { useSearchParams } from 'react-router-dom';

import SearchInput from '../SearchInput/SearchInput';
import classes from './SearchBlock.module.css';
import ErrorMessage from '../UI/ErrorMessage/ErrorMessage';
import Loading from '../UI/Loading/Loading';

const LoadingBlock = () => {
    return (
        <div className={classes['search-block__loading-block']}>
            <Loading />
        </div>
    );
};

const SearchBlock: FC<{
    debounceMs?: number;
    validationFn: (searchValue: string) => boolean;
    errorMessageOnValidationFail: string;
    isLoading: boolean;
    mainContent: React.ReactNode | null;
}> = ({ debounceMs = 500, ...props }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const debouncedSearch = useCallback(
        debounce((newSearchValue: string) => {
            if (newSearchValue === '') return;
            setSearchParams((prevSearchParams) => {
                prevSearchParams.set('searchQuery', newSearchValue);
                // whenever a value is fetched, the 'page' parameter must be reset
                prevSearchParams.set('page', '1');
                return prevSearchParams;
            });
        }, debounceMs),
        [setSearchParams]
    );

    const onSearchValueChange = useCallback(
        (newSearchValue: string) => {
            const isValid = props.validationFn(newSearchValue);
            setErrorMessage(
                isValid ? null : props.errorMessageOnValidationFail
            );
            if (isValid) debouncedSearch(newSearchValue);
        },
        [
            props.validationFn,
            setErrorMessage,
            props.errorMessageOnValidationFail,
            debouncedSearch,
        ]
    );

    return (
        <Fragment>
            <div className={classes['search-block']}>
                <SearchInput
                    className={classes['search-block__search-input']}
                    onValueChanged={onSearchValueChange}
                />
                {errorMessage !== null && (
                    <ErrorMessage
                        className={classes['search-block__error-message']}
                        textColor="#ff8585"
                    >
                        {errorMessage}
                    </ErrorMessage>
                )}
            </div>
            {props.isLoading && <LoadingBlock />}
            {props.mainContent}
        </Fragment>
    );
};

export default SearchBlock;
