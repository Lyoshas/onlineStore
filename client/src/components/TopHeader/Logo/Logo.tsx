import { FC } from 'react';
import { Link } from 'react-router-dom';

const Logo: FC<{ className?: string }> = (props) => {
    return (
        <Link to="/">
            <img
                src="/logo.svg"
                width="70"
                height="70"
                className={props.className}
                alt="Logo"
            />
        </Link>
    );
};

export default Logo;
