import { FC, useEffect, useState } from 'react';

import classes from './AdditionalOptions.module.css';
import CartProductDeleteButton from './CartProductDeleteButton/CartProductDeleteButton';

interface AdditionalOptionsProps {
    productId: number;
}

const AdditionalOptions: FC<AdditionalOptionsProps> = (props) => {
    const [showAdditionalOptions, setShowAdditionalOptions] =
        useState<boolean>(false);

    useEffect(() => {
        if (!showAdditionalOptions) return;

        document.body.addEventListener(
            'click',
            () => setShowAdditionalOptions(false),
            { once: true }
        );
    }, [showAdditionalOptions]);

    const handleImgClick = (
        event: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        event.stopPropagation();
        setShowAdditionalOptions(true);
    };

    return (
        <div className={classes['additional-options']}>
            <img
                className={classes['additional-options-img']}
                src={
                    'https://onlinestore-react-assets.s3.eu-north-1.amazonaws.com/three-dots-icon.svg'
                }
                alt="Additional options"
                onClick={handleImgClick}
            />
            {showAdditionalOptions && (
                <CartProductDeleteButton productId={props.productId} />
            )}
        </div>
    );
};

export default AdditionalOptions;
