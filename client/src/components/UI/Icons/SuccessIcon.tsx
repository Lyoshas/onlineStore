import { FC } from 'react';

const SuccessIcon: FC<{ className?: string }> = (props) => {
    return (
        <img
            src="/success-icon.svg"
            className={props.className || ''}
            alt="Success icon"
        />
    );
};

export default SuccessIcon;
