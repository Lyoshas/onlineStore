import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import classes from './CircleGrid.module.css';

const CircleGrid = () => {
    return (
        <img
            className={classes['hero__circle-grid']}
            src={getStaticAssetUrl('circle-grid.png')}
            alt="Decorative circle grid"
        />
    );
};

export default CircleGrid;
