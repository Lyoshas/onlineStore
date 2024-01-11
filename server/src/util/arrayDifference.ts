interface TempObj {
    [key: string]: number;
}

// returns the difference between "arr1" and "arr2"
// expressing it in the context of math, it's A \ B (or A - B)
// for example, arr1 = [1, 2, 3, 4, 5]; arr2 = [3, 4, 5, 6, 7] => result = [1, 2]
const arrayDifference = (arr1: number[], arr2: number[]): number[] => {
    const temp: TempObj = {};
    const result: number[] = [];

    for (let num of arr2) {
        temp[num] = 1;
    }

    for (let num of arr1) {
        if (!(num in temp)) result.push(num);
    }

    return result;
};

export default arrayDifference;
