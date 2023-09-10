interface Counter {
    [value: string]: number;
}

// For example:
// - arrayIntersection(['id', 'title', 'price'], ['image_url', 'title', 'id']) => ['id', 'title']
const arrayIntersection = (arr1: string[], arr2: string[]) => {
    const counter: Counter = {};
    const result: string[] = [];

    for (let val of arr1) {
        counter[val] = 1;
    }

    for (let val of arr2) {
        counter[val] = val in counter ? counter[val] + 1 : 1;
    }

    for (let [value, count] of Object.entries(counter)) {
        // if there is an intersection
        if (count >= 2) result.push(value);
    }

    return result;
};

export default arrayIntersection;
