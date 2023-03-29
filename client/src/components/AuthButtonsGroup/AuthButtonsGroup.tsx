import React from 'react';

import classes from './AuthButtonsGroup.module.css';

const AuthButtonsGroup: React.FC<{ children: React.ReactNode }> = (props) => {
    return (
        <div className={classes['auth-container__auth-buttons']}>
            {props.children}
        </div>
    );
};

export default AuthButtonsGroup;
