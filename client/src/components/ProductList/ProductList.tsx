import { FC } from 'react';
import classNames from 'classnames';

import ProductItem from '../ProductItem/ProductItem';
import classes from './ProductList.module.css';
import { Product } from '../../__generated__/graphql';

// copying everything from the Product type, but the 'isInTheCart' property is optional
type ProductModified = Omit<Product, 'isInTheCart'> & Partial<Pick<Product, 'isInTheCart'>>;

const ProductList: FC<{
    products: (Omit<ProductModified, 'category'> | null)[];
}> = (props) => {
    return (
        <section
            className={classNames(
                classes['product-list'],
                props.products.length === 1 && classes.centered
            )}
        >
            {props.products.map((product) => {
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
