import ExploreProductsBlock from '../../components/ExploreProductsBlock/ExploreProductsBlock';
import Hero from '../../components/Hero/Hero';
import Layout from '../../components/Layout/Layout';

const LandingPage = () => {
    return (
        <>
            <Hero />
            <Layout>
                <ExploreProductsBlock />
            </Layout>
        </>
    );
};

export default LandingPage;
