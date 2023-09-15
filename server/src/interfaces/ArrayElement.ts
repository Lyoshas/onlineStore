// extracts he type of the elements in an array
// examples:
// - ArrayElement<string[]> => string
// - ArrayElement<(string | number)[]> => string | number
type ArrayElement<T extends unknown[]> = T extends (infer U)[] ? U : never;

export default ArrayElement;
