import { Formik, Form } from 'formik';
import { FC } from 'react';

import classes from './EditProductForm.module.css';
import editProductSchema from '../editProductSchema';
import DBProduct from '../../../interfaces/DBProduct';
import FormInput from '../../Input/FormInput';
import FormActions from '../../FormActions/FormActions';
import SubmitButton from '../../UI/SubmitButton/SubmitButton';
import FormSelect from '../../FormSelect/FormSelect';
import SchemaContext from '../../../context/validationSchema';

interface EditProductFormProps {
    product: DBProduct;
    availableCategories: string[];
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
                category: product.category,
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
                        price: +values.price,
                        category: values.category,
                        quantityInStock: +values.quantityInStock,
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
                    <SchemaContext.Provider value={editProductSchema}>
                        <FormInput
                            type="text"
                            label="Title"
                            name="title"
                            placeholder="Enter product title"
                            isRequired={true}
                            value={product.title}
                        />
                        <FormInput
                            type="number"
                            label="Price"
                            name="price"
                            placeholder="Enter product price"
                            isRequired={true}
                            value={product.price}
                        />
                        <FormSelect
                            label="Category"
                            name="category"
                            options={props.availableCategories}
                            defaultOption={product.category}
                            isRequired={true}
                        />
                        <FormInput
                            type="number"
                            label="Quantity in stock"
                            name="quantityInStock"
                            placeholder="Enter how many products are available"
                            isRequired={true}
                            value={product.quantityInStock}
                        />
                        <FormInput
                            type="text"
                            label="Short description"
                            name="shortDescription"
                            placeholder="Enter product description"
                            isRequired={true}
                            value={product.shortDescription}
                        />
                    </SchemaContext.Provider>
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
