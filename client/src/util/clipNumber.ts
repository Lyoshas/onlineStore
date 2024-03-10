// this function is useful for ensuring that a numerical value stays within defined boundaries,
// preventing it from exceeding upper or lower limits.
const clipNumber = ({
    min,
    max,
    value,
}: {
    min: number;
    max: number;
    value: number;
}): number => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

export default clipNumber;
