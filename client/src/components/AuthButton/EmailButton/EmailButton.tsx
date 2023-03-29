import { FC } from 'react';
import AuthButton from '../AuthButton';

interface EmailButtonProps {
    textContent: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const EmailButton: FC<EmailButtonProps> = (props) => {
    return (
        <AuthButton
            textContent={props.textContent}
            providerImageURL="/email-icon.svg"
            onClick={props.onClick}
        />
    );
};

export default EmailButton;
