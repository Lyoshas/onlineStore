import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';

import Loading from '../UI/Loading/Loading';
import ErrorMessage from './ErrorMessage/ErrorMessage';
import SuccessMessage from './SuccessMessage/SuccessMessage';
import EditProductForm from './EditProductForm/EditProductForm';
import CenterBlock from '../UI/CenterBlock/CenterBlock';
import classes from './EditProduct.module.css';
import GET_ADMIN_PRODUCT_DETAILS from './GraphQL/getProductRequest';
import UPDATE_PRODUCT from './GraphQL/updateProductRequest';
import { useProductCategoriesQuery } from '../../store/apis/productCategoryApi';
import DBProduct from '../../interfaces/DBProduct';
import apolloClient from '../../graphql/client';
import GET_PRODUCT_BY_ID from '../ProductInfo/GraphQL/GetProductByIdRequest';

const EditProduct = () => {
    const { productId } = useParams();
    let {
        loading: isProductInfoLoading,
        error: productInfoError,
        data: productDetailsData,
    } = useQuery(GET_ADMIN_PRODUCT_DETAILS, {
        variables: { productId: +productId! },
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
    ] = useMutation(UPDATE_PRODUCT);

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
        const updatedProductResult = await updateProduct(options);
        const updatedProduct = updatedProductResult.data!.updateProduct;

        // after the product was updated it's necessary to update the cache
        // otherwise the product data will be stale
        const product = options.variables;
        const variables = { productId: product.id };

        // updating cache associated with "query AdminProduct($productId: Int!)"
        apolloClient.writeQuery({
            query: GET_ADMIN_PRODUCT_DETAILS,
            data: { adminProduct: product },
            variables,
        });
        // updating cache associated with "query Product($productId: Int!)" if it exists
        // this query is used when the user tries to go to the product details page
        apolloClient.writeQuery({
            query: GET_PRODUCT_BY_ID,
            data: { product: { ...product, ...updatedProduct } },
            variables,
        });
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
