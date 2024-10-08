import { Formik, Form } from 'formik';
import { FC, useRef } from 'react';

import classes from './EditProductForm.module.css';
import editProductSchema from '../../EditProduct/editProductSchema';
import DBProduct from '../../../interfaces/DBProduct';
import FormInput from '../../../components/Input/FormInput';
import FormActions from '../../../components/FormActions/FormActions';
import SubmitButton from '../../../components/UI/SubmitButton/SubmitButton';
import FormSelect from '../../../components/FormSelect/FormSelect';
import SchemaContext from '../../../context/validationSchema';
import { OnFormSubmitArgs as OnAddProductArgs } from '../../../components/AddProductForm/AddProductForm';

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
                maxOrderQuantity: product.maxOrderQuantity,
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
                    maxOrderQuantity: values.maxOrderQuantity,
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
                            defaultValue={product.title}
                        />
                        <FormInput
                            type="number"
                            label="Price"
                            name="price"
                            placeholder="Enter product price"
                            isRequired={true}
                            defaultValue={product.price}
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
                            defaultValue={product.quantityInStock}
                        />
                        <FormInput
                            type="text"
                            label="Short description"
                            name="shortDescription"
                            placeholder="Enter product description"
                            isRequired={true}
                            defaultValue={product.shortDescription}
                        />
                        <FormInput
                            type="number"
                            label="Max order quantity"
                            name="maxOrderQuantity"
                            placeholder="Enter the maximum quantity per order"
                            isRequired={true}
                            defaultValue={product.maxOrderQuantity}
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
