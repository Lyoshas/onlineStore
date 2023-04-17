import { useEffect, useMemo, useState } from 'react';

import ButtonLink from '../../UI/ButtonLink/ButtonLink';
import classes from './TextBlock.module.css';

const TextBlock = () => {
    // words to print on the screen
    // useMemo is used to cache the array in order to avoid unnecessary useEffect executions
    const products = useMemo(() => ['Laptops', 'Smartphones', 'Tablets'], []);
    // this will be shown on the screen
    const [typedText, setTypedText] = useState<string>('');
    // the index of the word we're trying to type
    const [typedWordIndex, setTypedWordIndex] = useState<number>(0);

    useEffect(() => {
        let typedWord = products[typedWordIndex];
        let typedWordLength = typedWord.length;
        let wordIndex = 1;
        let direction: 'forwards' | 'backwards' = 'forwards';

        const timer = setInterval(() => {
            if (direction === 'backwards' && wordIndex === -1) {
                clearInterval(timer);
                // next word
                setTypedWordIndex((prevIndex) => {
                    return prevIndex === products.length - 1 ? 0 : prevIndex + 1
                });
                return;
            }

            if (wordIndex > typedWordLength) {
                wordIndex--;
                return (direction = 'backwards');
            }

            setTypedText(typedWord.slice(0, wordIndex));

            if (direction === 'forwards') wordIndex++;
            else wordIndex--;
        }, 200);

        return () => clearInterval(timer);
    }, [typedWordIndex, products]);

    return (
        <div className={classes['hero__text-block']}>
            <h1 className={classes['text-block__heading']}>
                A wide range of{' '}
                <span className={classes['text-block__typed']}>{typedText}</span>
                <span className={classes['text-block__typed-cursor']}>|</span>
            </h1>
            <p className={classes['text-block__p']}>
                From smartphones and laptops to cutting-edge gadgets and beyond.
            </p>
            <ButtonLink to="#products-demo">Explore Products</ButtonLink>
        </div>
    );
};

export default TextBlock;
