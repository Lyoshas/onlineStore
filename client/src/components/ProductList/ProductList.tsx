import { FC } from 'react';
import classNames from 'classnames';

import ProductItem from '../ProductItem/ProductItem';
import classes from './ProductList.module.css';
import { Product } from '../../__generated__/graphql';

const ProductList: FC<{ products: (Omit<Product, 'category'> | null)[] }> = (
    props
) => {
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
                    />
                );
            })}
        </section>
    );
};

export default ProductList;
