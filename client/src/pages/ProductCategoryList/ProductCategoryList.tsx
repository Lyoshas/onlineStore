import Layout from '../../components/Layout/Layout';
import ProductCategoryItem from '../../components/ProductCategoryItem/ProductCategoryItem';
import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import LoadingScreen from '../../components/UI/LoadingScreen/LoadingScreen';
import { useProductCategoriesQuery } from '../../store/apis/productCategoryApi';
import deriveErrorMessage from '../../util/deriveErrorMessage';
import classes from './ProductCategoryList.module.css';

const ProductCategoryList = () => {
    const { data, isLoading, error } = useProductCategoriesQuery();

    if (isLoading) return <LoadingScreen />;

    if (error) {
        return (
            <ErrorMessageBlock
                message={
                    deriveErrorMessage(error) ||
                    'Щось пішло не так під час завантаження категорій товарів'
                }
            />
        );
    }

    return (
        <Layout>
            <h1 className={classes['product-category-page__heading']}>
                Оберіть категорію
            </h1>
            <div className={classes['product-category-list']}>
                {data!.categories.map((category, i) => (
                    <ProductCategoryItem
                        name={category.name}
                        previewURL={category.previewURL}
                        key={i}
                    />
                ))}
            </div>
        </Layout>
    );
};

export default ProductCategoryList;
