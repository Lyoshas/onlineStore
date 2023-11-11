const formatSqlQuery = (sqlQuery: string) => {
    return sqlQuery.replace(/(\t)|(\n)|(\s{2,})/g, ' ');
};

export default formatSqlQuery;
