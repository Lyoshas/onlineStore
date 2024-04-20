import { FC } from 'react';
import classNames from 'classnames';

import classes from './PreviewImage.module.css';

const PreviewImage: FC<{
    previewURL: string;
    imageId: number;
    previewImgBlockClassName?: string;
}> = (props) => {
    return (
        <div
            className={classNames(
                classes['preview-img-block'],
                props.previewImgBlockClassName
            )}
        >
            <img
                className={classes['preview-img__item']}
                src={props.previewURL}
                alt={`order-img-${props.imageId}`}
            />
        </div>
    );
};

export default PreviewImage;
