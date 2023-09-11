const snakeCaseToCamelCase = (inputStr: string): string => {
    return inputStr.replace(/_[a-z]/gi, (match: string) => {
        return match[1].toUpperCase();
    });
};

export default snakeCaseToCamelCase;
