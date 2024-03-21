import { ChangeEvent, FC, useCallback } from 'react';
import classNames from 'classnames';

import classes from './SearchInput.module.css';

const SearchInput: FC<{
    className?: string;
    onValueChanged: (newValue: string) => void;
}> = (props) => {
    const inputChangeHandler = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            props.onValueChanged(event.target.value);
        },
        []
    );

    return (
        <input
            type="text"
            name="search-input"
            placeholder="Search"
            className={classNames(classes['search-input'], props.className)}
            onChange={inputChangeHandler}
        />
    );
};

export default SearchInput;
