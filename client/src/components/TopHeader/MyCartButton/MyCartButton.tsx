import { Fragment } from 'react';
import ActionButton from '../ActionButton/ActionButton';

const MyCartButton = () => {
    const handleClick = () => {
        console.log('showing the cart...');
    };

    return (
        <ActionButton
            content={
                <Fragment>
                    My Cart (<span>0</span>)
                </Fragment>
            }
            imageURL="/cart-icon.svg"
            imageAlt="Cart icon"
            onClick={handleClick}
        />
    );
};

export default MyCartButton;