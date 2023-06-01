import { FC, Fragment } from 'react';
import classNames from 'classnames';

import classes from './ProductsDemo.module.css';

const products = [
    [classes.laptop, '/api/images/Asus-Laptop-X515EA-EJ3560.png', 'Laptop 1'],
    [classes.smartphone, '/api/images/Motorola-G32.png', 'Smartphone'],
    [classes.tablet, '/api/images/Samsung-Galaxy-Tab-S7-FE.png', 'Tablet'],
    [classes.laptop, '/api/images/HP-Pavilion-15-eh2234nw.png', 'Laptop 2'],
];

const ProductsDemo: FC<{ offset: number }> = (props) => {
    return (
        <Fragment>
            {products.map(([className, imageURL, altAttr], i) => {
                const offsetMultiplier = [0.8, 0.6, 1, 0.3][i];

                return (
                    <img
                        className={classNames(
                            classes['demo-products__img'],
                            className
                        )}
                        src={imageURL}
                        alt={altAttr}
                        key={altAttr}
                        style={{
                            transform: `translateX(${
                                props.offset * 0.15 * offsetMultiplier
                            }px) rotate(-45deg) `,
                        }}
                    />
                );
            })}
        </Fragment>
    );
};

export default ProductsDemo;