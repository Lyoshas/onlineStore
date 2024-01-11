const formatSqlQuery = (sqlQuery: string) => {
    return (
        sqlQuery
            .trim()
            // replace tabs and new lines with a space character
            .replace(/(\t)|(\n)/g, ' ')
            // replace two or more consecutive spaces
            .replace(/\s{2,}/g, ' ')
    );
};

export default formatSqlQuery;
