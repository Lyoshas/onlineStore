import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useFormikContext } from 'formik';

import StarRating from '../../../../../components/UI/StarRating/StarRating';

const StarRatingForm = () => {
    const [starRatingValue, setStarRatingValue] = useState<number>(0);
    const lessThan320Px = useMediaQuery({ query: '(max-width: 320px)' });
    const { setFieldValue, setFieldTouched } = useFormikContext();

    useEffect(() => {
        setFieldValue('starRating', starRatingValue);
    }, [starRatingValue, setFieldValue]);

    const starRatingClickHandler = () => {
        setFieldTouched('starRating', true);
    };

    return (
        <StarRating
            value={starRatingValue}
            starColor="#777"
            starSize={lessThan320Px ? '1.8rem' : '2.5rem'}
            onChange={(event, newValue) => {
                if (newValue === null) return;
                setStarRatingValue(newValue < 1 ? 1 : newValue);
            }}
            onClick={starRatingClickHandler}
        />
    );
};

export default StarRatingForm;
