import { FC } from 'react';

import classes from './PasswordTips.module.css';

const PasswordTips: FC = () => {
    return (
        <div className={classes['form__password-requirements']}>
            <p className={classes['password-requirements__intro']}>
                Пароль повинен мати:
            </p>
            <ul className={classes['password-requirements__ul']}>
                <li>8 символів або довше, але не більше 72 символів</li>
                <li>Містити принаймні 1 цифру</li>
                <li>Містити принаймні 1 велику літеру</li>
                <li>Містити принаймні 1 малу літеру</li>
                <li>Містити принаймні 1 спеціальний символ (!, @, #, тощо)</li>
            </ul>
        </div>
    );
};

export default PasswordTips;
