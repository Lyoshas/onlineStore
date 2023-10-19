import { FC } from 'react';
import classNames from 'classnames';

import classes from './Image.module.css';

interface ImageProps {
    src: string;
    alt: string;
    // "invertImage" specifies whether the 'filter: invert(100%)' property should be applied to the image
    invertColor?: boolean;
    className?: string;
}

const Image: FC<ImageProps> = ({ src, alt, invertColor = true, className }) => {
    return (
        <img
            src={src}
            className={classNames(
                classes.icon,
                className,
                invertColor && classes['invert-color']
            )}
            alt={alt}
        />
    );
};

export default Image;
