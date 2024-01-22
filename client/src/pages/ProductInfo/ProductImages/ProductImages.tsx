import { FC } from 'react';
import classNames from 'classnames';

import classes from './ProductImages.module.css';

interface ProductImagesProps {
    initialImageUrl: string;
    additionalImageUrl: string;
    // 0 - the first image, 1 - the second image
    selectedImage: 0 | 1;
    onSelectImage: (imageIndex: 0 | 1) => void;
}

const ProductImages: FC<ProductImagesProps> = (props) => {
    return (
        <section className={classes['product-info__photos']}>
            {[props.initialImageUrl, props.additionalImageUrl].map(
                (imageUrl, i) => (
                    <img
                        className={classNames(
                            classes['product-photos__img'],
                            i === props.selectedImage && classes.selected
                        )}
                        src={imageUrl}
                        alt={`Image ${i}`}
                        onClick={() => props.onSelectImage(i as 0 | 1)}
                        key={i}
                    />
                )
            )}
        </section>
    );
};

export default ProductImages;
