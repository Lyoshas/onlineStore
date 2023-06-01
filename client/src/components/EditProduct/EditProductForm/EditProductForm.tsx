import { Formik, Form } from 'formik';
import { FC } from 'react';

import classes from './EditProductForm.module.css';
import editProductSchema from '../editProductSchema';
import DBProduct from '../../../interfaces/DBProduct';
import FormInput from '../../Input/FormInput';
import FormActions from '../../FormActions/FormActions';
import SubmitButton from '../../UI/SubmitButton/SubmitButton';

interface EditProductFormProps {
    product: DBProduct;
    // if the user has sent the form, this component will show the loading progress
    isUpdateRequestLoading: boolean;
    onEditProduct: (options: { variables: DBProduct }) => unknown;
}

const EditProductForm: FC<EditProductFormProps> = (props) => {
    const product = props.product;

    return (
        <Formik
            validationSchema={editProductSchema}
            validateOnBlur={true}
            validateOnChange={true}
            initialValues={{
                title: product.title,
                price: product.price,
                quantityInStock: product.quantityInStock,
                initialImageUrl: product.initialImageUrl,
                additionalImageUrl: product.additionalImageUrl,
                shortDescription: product.shortDescription,
            }}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);
                props.onEditProduct({
                    variables: {
                        id: props.product.id,
                        title: values.title,
                        price: values.price,
                        quantityInStock: values.quantityInStock,
                        initialImageUrl: values.initialImageUrl,
                        additionalImageUrl: values.additionalImageUrl,
                        shortDescription: values.shortDescription,
                    },
                });
                setSubmitting(false);
            }}
        >
            {(formik) => (
                <Form className={classes['edit-product-form']}>
                    <h2 className={classes['edit-product-form__heading']}>
                        Edit Product Data
                    </h2>
                    <FormInput
                        type="text"
                        label="Title"
                        name="title"
                        placeholder="Enter product title"
                        validationSchema={editProductSchema}
                        isRequired={true}
                        value={product.title}
                    />
                    <FormInput
                        type="number"
                        label="Price"
                        name="price"
                        placeholder="Enter product price"
                        validationSchema={editProductSchema}
                        isRequired={true}
                        value={product.price}
                    />
                    <FormInput
                        type="number"
                        label="Quantity in stock"
                        name="quantityInStock"
                        placeholder="Enter how many products are available"
                        validationSchema={editProductSchema}
                        isRequired={true}
                        value={product.quantityInStock}
                    />
                    <FormInput
                        type="text"
                        label="Short description"
                        name="shortDescription"
                        placeholder="Enter product description"
                        validationSchema={editProductSchema}
                        isRequired={true}
                        value={product.shortDescription}
                    />
                    <FormActions>
                        <SubmitButton
                            isLoading={props.isUpdateRequestLoading}
                            label="Change Product"
                            className={
                                classes['edit-product-form__submit-button']
                            }
                            considerDirtyProp={false}
                        />
                    </FormActions>
                </Form>
            )}
        </Formik>
    );
};

export default EditProductForm;
