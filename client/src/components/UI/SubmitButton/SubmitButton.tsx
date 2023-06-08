import { useFormikContext } from 'formik';
import { FC } from 'react';

import Button from '../Button/Button';
import Loading from '../Loading/Loading';

const SubmitButton: FC<{
    label: string;
    isLoading: boolean;
    className?: string;
    considerDirtyProp?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({
    // "considerDirtyProp" specifies whether to make the submit button disabled if the form is dirty
    // form "dirtiness" specifies whether the form was edited or not
    // if a user edited the form, the form is dirty
    // "considerDirtyProp" is true by default, so by default is the form is NOT dirty, the submit button will be disabled
    considerDirtyProp = true,
    ...props
}) => {
    const { isSubmitting, dirty, errors } = useFormikContext();
    const { isLoading } = props;

    return (
        <Button
            type="submit"
            disabled={
                isSubmitting ||
                isLoading ||
                // dirty indicates whether the form fields have been modified or not
                // if "considerDirtyProp" is set to true, the "dirty" attribute will be considered
                (considerDirtyProp && !dirty) ||
                // or disable the button when there are validation errors
                Object.keys(errors).length !== 0
            }
            onClick={props.onClick}
            className={props.className}
        >
            {isLoading || isSubmitting ? (
                <Loading width="30px" height="30px" />
            ) : (
                props.label
            )}
        </Button>
    );
};

export default SubmitButton;
