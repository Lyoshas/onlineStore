export interface ApplicationError {
    // "message" is a description of a validation error for the current field
    message: string;
    // "field" specifies the field that the message refers to
    field?: string;
}
