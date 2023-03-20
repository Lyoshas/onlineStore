import { useFormikContext } from 'formik';
import { FC } from 'react';

import Button from '../Button/Button';
import Loading from '../Loading/Loading';

const SubmitButton: FC<{
    label: string;
    isLoading: boolean;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = (props) => {
    const { isSubmitting, dirty, errors } = useFormikContext();
    const { isLoading } = props;

    return (
        <Button
            type="submit"
            disabled={
                isSubmitting ||
                isLoading ||
                // dirty indicates whether the form fields have been modified or not
                !dirty ||
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
