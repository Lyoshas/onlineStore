import { FC } from 'react';

import ProductItem from '../ProductItem/ProductItem';
import classes from './ProductList.module.css';
import { Product } from '../../__generated__/graphql';

const ProductList: FC<{ products: (Product | null)[] }> = (props) => {
    return (
        <section className={classes['product-list']}>
            {props.products.map((product) => (
                <ProductItem
                    key={product!.id}
                    id={product!.id}
                    title={product!.title}
                    initialImageURL={product!.initialImageUrl}
                    additionalImageURL={product!.additionalImageUrl}
                    price={product!.price}
                    shortDescription={product!.shortDescription}
                    isAvailable={product!.isAvailable}
                    isRunningOut={product!.isRunningOut}
                />
            ))}
        </section>
    );
};

export default ProductList;
