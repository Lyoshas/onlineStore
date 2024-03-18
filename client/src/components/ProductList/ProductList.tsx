import { FC } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import ProductItem from '../ProductItem/ProductItem';
import classes from './ProductList.module.css';
import { RootState } from '../../store';

interface Product {
    id: number;
    title: string;
    initialImageUrl: string;
    additionalImageUrl: string;
    price: number;
    shortDescription: string;
    isAvailable: boolean;
    isRunningOut: boolean;
    isInTheCart?: boolean;
    userRating?: number | null;
}

const ProductList: FC<{
    products: Product[];
}> = (props) => {
    const localCartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );
    const productsToDisplay = props.products.map((fetchedProduct) => {
        return {
            ...fetchedProduct,
            isInTheCart: localCartProducts[fetchedProduct.id] ? true : false,
        };
    });

    return (
        <section
            className={classNames(
                classes['product-list'],
                props.products.length === 1 && classes.centered
            )}
        >
            {productsToDisplay.map((product) => {
                return (
                    <ProductItem
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        initialImageURL={product.initialImageUrl}
                        additionalImageURL={product.additionalImageUrl}
                        price={product.price}
                        shortDescription={product.shortDescription}
                        isAvailable={product.isAvailable}
                        isRunningOut={product.isRunningOut}
                        isInTheCart={product.isInTheCart}
                        userRating={product.userRating}
                    />
                );
            })}
        </section>
    );
};

export default ProductList;
