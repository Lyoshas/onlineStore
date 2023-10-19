import { FC, useEffect, useState } from 'react';

import classes from './AdditionalOptions.module.css';
import Button from '../../UI/Button/Button';

interface AdditionalOptionsProps {
    onDeleteProductFromCart: () => void;
}

const AdditionalOptions: FC<AdditionalOptionsProps> = (props) => {
    const [showDeleteButton, setShowDeleteButton] = useState<boolean>(false);

    useEffect(() => {
        if (!showDeleteButton) return;

        document.body.addEventListener(
            'click',
            () => setShowDeleteButton(false),
            { once: true }
        );
    }, [showDeleteButton]);

    const handleImgClick = (
        event: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        event.stopPropagation();
        setShowDeleteButton(true);
    };

    const handleCartProductDelete = () => {
        props.onDeleteProductFromCart();
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
            {showDeleteButton && (
                <Button
                    className={classes['cart-product__delete-from-cart-btn']}
                    onClick={handleCartProductDelete}
                >
                    <img
                        className={classes['delete-from-cart-btn__img']}
                        src={
                            'https://onlinestore-react-assets.s3.eu-north-1.amazonaws.com/delete-icon.svg'
                        }
                        alt="Delete icon"
                    />
                    Delete
                </Button>
            )}
        </div>
    );
};

export default AdditionalOptions;
