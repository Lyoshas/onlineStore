import { FC } from 'react';
import AuthButton from '../AuthButton';

const GoogleButton: FC<{ textContent: string }> = (props) => {
    return (
        <AuthButton
            textContent={props.textContent}
            providerImageURL="/google-icon.svg"
            redirectTo="/auth/log-in-with/google"
        />
    );
};

export default GoogleButton;
