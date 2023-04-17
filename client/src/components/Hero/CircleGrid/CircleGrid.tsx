import classes from './CircleGrid.module.css';

const CircleGrid = () => {
    return (
        <img
            className={classes['hero__circle-grid']}
            src="/circle-grid.png"
            alt="Decorative circle grid"
        />
    );
};

export default CircleGrid;
