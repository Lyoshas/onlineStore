import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import classes from './ProductCategoryItem.module.css';
import ProductCategory from '../../interfaces/ProductCategory';

const ProductCategoryItem: FC<ProductCategory> = (props) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // 'navigate' was used here instead of <Link /> because it's tricky to apply appropriate CSS styles to the link
        navigate(`/products/category/${props.name}`);
    };

    return (
        <article
            className={classes['product-category-item']}
            onClick={handleClick}
        >
            <h2 className={classes['product-category-item__name']}>
                {props.name}
            </h2>
            <img
                src={props.previewURL}
                className={classes['product-category-item__preview-url']}
                alt={props.name}
            />
        </article>
    );
};

export default ProductCategoryItem;
