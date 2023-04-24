import ExploreProductsBlock from '../ExploreProductsBlock/ExploreProductsBlock';
import Hero from '../Hero/Hero';
import Layout from '../Layout/Layout';

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
