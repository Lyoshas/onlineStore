import { FC } from 'react';

import AuthButton from '../AuthButton';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

const FacebookButton: FC<{ textContent: string }> = (props) => {
    return (
        <AuthButton
            textContent={props.textContent}
            providerImageURL={getStaticAssetUrl('facebook-icon.svg')}
            redirectTo="/auth/log-in-with/facebook"
        />
    );
};

export default FacebookButton;
