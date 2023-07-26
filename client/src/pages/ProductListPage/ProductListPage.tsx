import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProductList from '../../components/ProductList/ProductList';
import GET_PRODUCTS_BY_PAGE from './GraphQL/getProductsByPage';
import Loading from '../../components/UI/Loading/Loading';
import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import Layout from '../../components/Layout/Layout';
import classes from './ProductListPage.module.css';
import Pagination from './Pagination/Pagination';

const ProductListPage = () => {
    const [searchParams] = useSearchParams();
    // if "page" is not specified in the query string, set to default value of 1
    const currentPage: number = Number(searchParams.get('page')) || 1;

    const { loading, error, data } = useQuery(GET_PRODUCTS_BY_PAGE, {
        variables: { page: currentPage },
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (data?.products.productList.length !== 0) return;

        // if there are no products, it means the user has gone too far,
        // so we need to redirect to the first page
        navigate(`?page=1`);
    }, [data, navigate]);

    if (loading || data?.products.productList.length === 0) {
        return (
            <div className="flex-wrapper">
                <Loading />
            </div>
        );
    }

    if (error) {
        return <ErrorMessageBlock message={error.message} />;
    }

    return (
        <Layout className={classes['product-layout']}>
            <ProductList products={data!.products.productList} />
            <Pagination
                currentPage={currentPage}
                totalPages={data!.products.totalPages}
            />
        </Layout>
    );
};

export default ProductListPage;
