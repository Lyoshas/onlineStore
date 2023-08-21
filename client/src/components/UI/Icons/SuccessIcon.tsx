import { FC } from 'react';

import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

const SuccessIcon: FC<{ className?: string }> = (props) => {
    return (
        <img
            src={getStaticAssetUrl('success-icon.svg')}
            className={props.className || ''}
            alt="Success icon"
        />
    );
};

export default SuccessIcon;
