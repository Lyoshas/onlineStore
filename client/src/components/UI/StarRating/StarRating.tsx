import { Rating, RatingProps } from '@mui/material';
import { CSSProperties, FC } from 'react';
import StarIcon from '@mui/icons-material/Star';

const StarRating: FC<{
    value: number;
    starColor?: string;
    starSize?: CSSProperties['fontSize'];
    readOnly?: boolean;
    onChange?: RatingProps['onChange'];
    onClick?: RatingProps['onClick'];
    className?: string;
}> = ({ starColor = 'white', ...props }) => {
    const starSizeProp = props.starSize && { fontSize: props.starSize };
    const CustomIcon = (
        <StarIcon
            style={{
                color: starColor,
                ...starSizeProp,
            }}
        />
    );

    return (
        <Rating
            value={props.value}
            precision={0.5}
            emptyIcon={CustomIcon}
            className={props.className}
            onChange={props.onChange}
            onClick={props.onClick}
            readOnly={props.readOnly}
            sx={{ ...starSizeProp }}
        />
    );
};

export default StarRating;
