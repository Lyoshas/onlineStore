import { FC } from 'react';

import AuthButton from '../AuthButton';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

const GoogleButton: FC<{ textContent: string }> = (props) => {
    return (
        <AuthButton
            textContent={props.textContent}
            providerImageURL={getStaticAssetUrl('google-icon.svg')}
            redirectTo="/auth/log-in-with/google"
        />
    );
};

export default GoogleButton;
