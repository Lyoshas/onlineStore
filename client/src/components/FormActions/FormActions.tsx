import { FC } from 'react';

import classes from '../SignUpForm/SignupForm.module.css';

const FormActions: FC<{ children?: React.ReactNode }> = (props) => {
    return <div className={classes['form-actions']}>{props.children}</div>;
};

export default FormActions;
