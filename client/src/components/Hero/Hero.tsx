import { MouseEvent, useEffect, useState } from 'react';

import classes from './Hero.module.css';
import ProductsDemo from './ProductsDemo/ProductsDemo';
import RotatingCircle from './RotatingCircle/RotatingCircle';
import SolidCircle from './SolidCircle/SolidCircle';
import SmallShapes from './SmallShapes/SmallShapes';
import TextBlock from './TextBlock/TextBlock';

const Hero = () => {
    const [mouseOffsetX, setMouseOffsetX] = useState<number>(0);
    const [pageYOffset, setPageYOffset] = useState<number>(0);
    const initialPosition = window.innerWidth / 2;
    const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
        setMouseOffsetX(initialPosition - event.clientX);
    };

    useEffect(() => {
        const handleScroll = () => {
            setPageYOffset(window.pageYOffset);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className={classes.hero} onMouseMove={handleMouseMove}>
            <RotatingCircle pageYOffset={pageYOffset} />
            <SmallShapes pageYOffset={pageYOffset} />
            <ProductsDemo offset={mouseOffsetX} />
            <SolidCircle offset={mouseOffsetX} />
            <TextBlock />
        </section>
    );
};

export default Hero;
