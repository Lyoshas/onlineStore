// creates parameters to prevent SQL injection
// example: serializeSqlParameters(2) => '($1, $2),($3, $4)'
const serializeSqlParameters = (productEntriesNum: number): string => {
    let i: number = 0;
    let parameterizedQuery: string = '';

    for (let j = 0; j < productEntriesNum; j++) {
        parameterizedQuery += `($${++i}, $${++i}),`;
    }

    return parameterizedQuery.slice(0, -1);
};

export default serializeSqlParameters;
