import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';

import Loading from '../UI/Loading/Loading';
import { RootState } from '../../store';
import ErrorMessage from './ErrorMessage/ErrorMessage';
import SuccessMessage from './SuccessMessage/SuccessMessage';
import EditProductForm from './EditProductForm/EditProductForm';
import CenterBlock from '../UI/CenterBlock/CenterBlock';
import classes from './EditProduct.module.css';
import GET_PRODUCT_DETAILS from './GraphQL/getProductRequest';
import UPDATE_PRODUCT from './GraphQL/updateProductRequest';
import { useProductCategoriesQuery } from '../../store/apis/productCategoryApi';
import DBProduct from '../../interfaces/DBProduct';

const EditProduct = () => {
    const { productId } = useParams();
    const accessToken = useSelector(
        (state: RootState) => state.auth.accessToken
    );
    const additionalQueryProperties = {
        context: {
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        },
    };
    let {
        loading: isProductInfoLoading,
        error: productInfoError,
        data: productDetailsData,
        refetch: refetchProductDetails,
    } = useQuery(GET_PRODUCT_DETAILS, {
        variables: { productId: +productId! },
        ...additionalQueryProperties,
    });
    const {
        isLoading: areProductCategoriesLoading,
        error: productCategoriesError,
        data: productCategories,
    } = useProductCategoriesQuery();
    let [
        updateProduct,
        {
            loading: isUpdateRequestLoading,
            error: updateProductError,
            data: updateProductData,
        },
    ] = useMutation(UPDATE_PRODUCT, { ...additionalQueryProperties });

    if (isProductInfoLoading || areProductCategoriesLoading) {
        return (
            <div className="flex-wrapper">
                <Loading />
            </div>
        );
    }

    if (productInfoError || updateProductError || productCategoriesError) {
        const message = `Something went wrong while ${
            productInfoError
                ? 'loading the product data'
                : updateProductError
                ? 'editing the product'
                : 'loading product categories'
        }.\n${
            productInfoError
                ? productInfoError.message
                : updateProductError
                ? updateProductError!.message
                : productCategoriesError
        }`;

        return <ErrorMessage message={message} />;
    }

    // if the product was updated successfully
    if (updateProductData) {
        return <SuccessMessage />;
    }

    // by this point we have the product details
    const product = productDetailsData!.adminProduct!;

    const handleEditProduct = async (options: { variables: DBProduct }) => {
        await updateProduct(options);
        // after the product was updated it's necessary to refetch product details,
        // otherwise the product data will be stale
        await refetchProductDetails();
    };

    return (
        <CenterBlock className={classes['edit-product-block']}>
            <EditProductForm
                // passing information about the product
                product={{ id: +productId!, ...product }}
                availableCategories={productCategories!.categories}
                // passing whether the edit request is loading
                isUpdateRequestLoading={isUpdateRequestLoading}
                // passing the function that will be called to initiate the API request
                onEditProduct={handleEditProduct}
            />
        </CenterBlock>
    );
};

export default EditProduct;
