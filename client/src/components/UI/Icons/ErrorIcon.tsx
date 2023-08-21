import { FC } from 'react';

import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

const ErrorIcon: FC<{ className?: string }> = (props) => {
    return (
        <img
            src={getStaticAssetUrl('error-icon.png')}
            className={props.className || ''}
            alt="Error icon"
        />
    );
};

export default ErrorIcon;
