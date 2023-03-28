import { Link } from 'react-router-dom';

const Logo = () => {
    return (
        <Link to="/">
            <img src="/logo.svg" width="70" height="70" alt="Logo" />
        </Link>
    );
};

export default Logo;
