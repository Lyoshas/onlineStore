import { FC } from 'react';
import AuthButton from '../AuthButton';

const FacebookButton: FC<{ textContent: string }> = (props) => {
    return (
        <AuthButton
            textContent={props.textContent}
            providerImageURL="/facebook-icon.svg"
            redirectTo="/auth/log-in-with/facebook"
        />
    );
};

export default FacebookButton;
