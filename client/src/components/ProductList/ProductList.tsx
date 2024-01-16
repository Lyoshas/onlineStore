import { FC } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import ProductItem from '../ProductItem/ProductItem';
import classes from './ProductList.module.css';
import { Product } from '../../__generated__/graphql';
import { RootState } from '../../store';

// copying everything from the Product type, but the 'isInTheCart' property is optional
type ProductModified = Omit<Product, 'isInTheCart'> &
    Partial<Pick<Product, 'isInTheCart'>>;

const ProductList: FC<{
    products: (Omit<ProductModified, 'category'> | null)[];
}> = (props) => {
    const localCartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );
    const productsToDisplay = props.products.map((fetchedProduct) => {
        if (fetchedProduct === null) return null;
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
                if (product === null) return false;

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
                    />
                );
            })}
        </section>
    );
};

export default ProductList;
