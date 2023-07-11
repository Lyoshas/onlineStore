import { Formik, Form } from 'formik';
import { FC, useRef } from 'react';

import classes from './EditProductForm.module.css';
import editProductSchema from '../editProductSchema';
import DBProduct from '../../../interfaces/DBProduct';
import FormInput from '../../Input/FormInput';
import FormActions from '../../FormActions/FormActions';
import SubmitButton from '../../UI/SubmitButton/SubmitButton';
import FormSelect from '../../FormSelect/FormSelect';
import SchemaContext from '../../../context/validationSchema';
import { OnFormSubmitArgs as OnAddProductArgs } from '../../AddProductForm/AddProductForm';

interface EditProductFormProps {
    product: DBProduct & {
        initialImageName: string;
        additionalImageName: string;
    };
    availableCategories: string[];
    // if the user has sent the form, this component will show the loading progress
    isUpdateRequestLoading: boolean;
    // onEditProduct: (options: { variables: DBProduct }) => unknown;
    onEditProduct: (
        formData: OnAddProductArgs & {
            previousInitialImageName: string;
            previousAdditionalImageName: string;
        }
    ) => void;
}

const EditProductForm: FC<EditProductFormProps> = (props) => {
    const product = props.product;
    const initialImageRef = useRef<HTMLInputElement>(null);
    const additionalImageRef = useRef<HTMLInputElement>(null);

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
                initialImageInfo: { size: 0, type: '' },
                additionalImageInfo: { size: 0, type: '' },
                shortDescription: product.shortDescription,
            }}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);
                props.onEditProduct({
                    title: values.title,
                    price: +values.price,
                    category: values.category,
                    quantityInStock: +values.quantityInStock,
                    initialImageInfo: values.initialImageInfo,
                    additionalImageInfo: values.additionalImageInfo,
                    initialImageInput: initialImageRef.current!,
                    additionalImageInput: additionalImageRef.current!,
                    shortDescription: values.shortDescription,
                    previousInitialImageName: product.initialImageName,
                    previousAdditionalImageName: product.additionalImageName,
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
                        <pre>{JSON.stringify(formik.values, null, 4)}</pre>
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
                        <FormInput
                            isRequired={false}
                            type="file"
                            label="Initial Image (if not selected, the image won't be changed)"
                            name="initialImageInfo"
                            placeholder="Select the main image for the product"
                            validateOnChange={true}
                            validateOnBlur={true}
                            ref={initialImageRef}
                        />
                        <FormInput
                            isRequired={false}
                            type="file"
                            label="Additional Image (if not selected, the image won't be changed)"
                            name="additionalImageInfo"
                            placeholder="Select the additional image for the product"
                            validateOnChange={true}
                            validateOnBlur={true}
                            ref={additionalImageRef}
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
