export default interface ServerErrorResponse {
    errors: {
        message: string;
        field: string;
    }[];
}
