import { FC } from 'react';
import { Link } from 'react-router-dom';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

const Logo: FC<{ className?: string }> = (props) => {
    return (
        <Link to="/">
            <img
                src={getStaticAssetUrl('logo.svg')}
                width="70"
                height="70"
                className={props.className}
                alt="Logo"
            />
        </Link>
    );
};

export default Logo;
