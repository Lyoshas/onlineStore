import classNames from 'classnames';
import { FC } from 'react';
import { useMediaQuery } from 'react-responsive';

import classes from './SelectedImage.module.css';

interface SelectedImageProps {
    currentImageUrl: string;
    onNextImage: () => void;
    onPreviousImage: () => void;
}

const SelectedImage: FC<SelectedImageProps> = (props) => {
    const lessThan1200Px = useMediaQuery({ query: '(max-width: 1200px)' });

    console.log(lessThan1200Px);

    return (
        <section
            className={classNames(
                classes['selected-image-block'],
                lessThan1200Px && classes['no-margin-right']
            )}
        >
            <div
                className={classNames(
                    classes['selected-image__image-action'],
                    classes['previous-button']
                )}
                onClick={props.onPreviousImage}
            >
                {'<'}
            </div>
            <img
                className={classes['selected-image__item']}
                src={props.currentImageUrl}
                alt="Current product image"
            />
            <div
                className={classNames(
                    classes['selected-image__image-action'],
                    classes['next-button']
                )}
                onClick={props.onNextImage}
            >
                {'>'}
            </div>
        </section>
    );
};

export default SelectedImage;
