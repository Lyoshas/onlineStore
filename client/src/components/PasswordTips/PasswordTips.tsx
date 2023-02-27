import { FC } from 'react';

import classes from './PasswordTips.module.css';

const PasswordTips: FC = () => {
    return (
        <div className={classes['form__password-requirements']}>
            <p className={classes['password-requirements__intro']}>
                Password must be:
            </p>
            <ul className={classes['password-requirements__ul']}>
                <li>8 characters or longer, not exceeding 72 characters</li>
                <li>Include at least 1 number</li>
                <li>Include at least 1 uppercase letter</li>
                <li>Include at least 1 lowercase letter</li>
                <li>Include at least 1 special character (!, @, #, etc)</li>
            </ul>
        </div>
    );
};

export default PasswordTips;
