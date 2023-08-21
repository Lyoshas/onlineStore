import { FC } from 'react';

import AuthButton from '../AuthButton';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

interface EmailButtonProps {
    textContent: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const EmailButton: FC<EmailButtonProps> = (props) => {
    return (
        <AuthButton
            textContent={props.textContent}
            providerImageURL={getStaticAssetUrl('email-icon.svg')}
            onClick={props.onClick}
        />
    );
};

export default EmailButton;
