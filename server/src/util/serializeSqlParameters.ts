// creates parameters to prevent SQL injection
// example:
// - serializeSqlParameters(2, 3) => '($1, $2, $3), ($4, $5, $6)'
// - serializeSqlParameters(2, 2) => '($1, $2), ($3, $4)'
const serializeSqlParameters = (
    productEntriesNum: number,
    parametersPerEntry: number
): string => {
    let i: number = 0;
    let parameterizedQuery: string = '';

    for (let j = 0; j < productEntriesNum; j++) {
        let bindings: string[] = [];
        for (let k = 0; k < parametersPerEntry; k++) {
            bindings.push(`$${++i}`);
        }

        parameterizedQuery += `(${bindings.join(', ')}), `;
    }

    return parameterizedQuery.slice(0, -2);
};

export default serializeSqlParameters;
