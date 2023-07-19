import { Formik, Form } from 'formik';
import { FC, useRef } from 'react';

import CenterBlock from '../UI/CenterBlock/CenterBlock';
import classes from './AddProductForm.module.css';
import addProductSchema from '../../pages/AddProduct/addProductSchema';
import SchemaContext from '../../context/validationSchema';
import FormInput from '../Input/FormInput';
import FormSelect from '../FormSelect/FormSelect';
import FormActions from '../FormActions/FormActions';
import SubmitButton from '../UI/SubmitButton/SubmitButton';

const initialValues = {
    title: '',
    price: 0,
    initialImageInfo: { size: 0, type: '' },
    additionalImageInfo: { size: 0, type: '' },
    quantityInStock: 0,
    shortDescription: '',
    category: '',
};
export type FormValues = typeof initialValues;

export type OnFormSubmitArgs = FormValues & {
    initialImageInput: HTMLInputElement;
    additionalImageInput: HTMLInputElement;
};

interface AddProductFormProps {
    onFormSubmit: (formData: OnFormSubmitArgs) => void;
    productCategories: string[];
}

const AddProductForm: FC<AddProductFormProps> = (props) => {
    const initialImageRef = useRef<HTMLInputElement>(null);
    const additionalImageRef = useRef<HTMLInputElement>(null);

    const defaultCategory = props.productCategories[0];

    return (
        <CenterBlock className={classes['add-product-block']}>
            <h2 className={classes['add-product__title']}>Add Product</h2>
            <Formik
                validationSchema={addProductSchema}
                validateOnBlur={true}
                validateOnChange={true}
                initialValues={{
                    ...initialValues,
                    category: defaultCategory,
                }}
                onSubmit={async (values, { setSubmitting }) => {
                    setSubmitting(true);
                    props.onFormSubmit({
                        ...values,
                        initialImageInput: initialImageRef.current!,
                        additionalImageInput: additionalImageRef.current!,
                    });
                    setSubmitting(false);
                }}
            >
                {(formik) => (
                    <Form>
                        <SchemaContext.Provider value={addProductSchema}>
                            <FormInput
                                isRequired={true}
                                type="text"
                                label="Title (<= 200 characters)"
                                name="title"
                                placeholder="Enter a product title"
                            />
                            <FormInput
                                isRequired={true}
                                type="number"
                                label="Price"
                                name="price"
                                placeholder="Enter a product price"
                                min={0}
                                step={0.01}
                            />
                            <FormInput
                                isRequired={true}
                                type="file"
                                label="Initial Image"
                                name="initialImageInfo"
                                placeholder="Select the main image for the product"
                                validateOnChange={true}
                                validateOnBlur={true}
                                ref={initialImageRef}
                            />
                            <FormInput
                                isRequired={true}
                                type="file"
                                label="Additional Image"
                                name="additionalImageInfo"
                                placeholder="Select the additional image for the product"
                                validateOnChange={true}
                                validateOnBlur={true}
                                ref={additionalImageRef}
                            />
                            <FormInput
                                isRequired={true}
                                type="number"
                                label="Quantity in stock"
                                name="quantityInStock"
                                placeholder="Enter how many products are available"
                            />
                            <FormInput
                                isRequired={true}
                                type="text"
                                label="Short description (<= 300 characters)"
                                name="shortDescription"
                                placeholder="Enter a description of the product"
                            />
                            <FormSelect
                                isRequired={true}
                                label="Select a category"
                                name="category"
                                options={props.productCategories}
                                defaultOption={defaultCategory}
                            />
                            <FormActions>
                                <SubmitButton
                                    label="Confirm"
                                    isLoading={false}
                                />
                            </FormActions>
                        </SchemaContext.Provider>
                    </Form>
                )}
            </Formik>
        </CenterBlock>
    );
};

export default AddProductForm;
