import { FC, useEffect, useState } from 'react';

import classes from './AdditionalOptions.module.css';
import CartProductDeleteButton from './CartProductDeleteButton/CartProductDeleteButton';
import useCartProductDelete from './hooks/useCartProductDelete';

interface AdditionalOptionsProps {
    productId: number;
}

const AdditionalOptions: FC<AdditionalOptionsProps> = (props) => {
    const { deleteCartProduct } = useCartProductDelete(props.productId);
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
                <CartProductDeleteButton
                    onCartProductDelete={() => deleteCartProduct()}
                />
            )}
        </div>
    );
};

export default AdditionalOptions;
