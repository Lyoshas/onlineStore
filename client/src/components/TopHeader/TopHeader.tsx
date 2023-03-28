import { FC, Fragment, useState, useEffect } from 'react';
import classNames from 'classnames';

import classes from './TopHeader.module.css';
import Logo from './Logo/Logo';
import Navigation from './Navigation/Navigation';
import AuthLinks from './AuthLinks/AuthLinks';
import MyCartButton from './MyCartButton/MyCartButton';
import Loading from '../UI/Loading/Loading';
import MainBlock from './MainBlock/MainBlock';
import Layout from '../Layout/Layout';

// "isAuthenticated: null" means that the client hasn't sent the request yet
const TopHeader: FC<{
    isAuthenticated: boolean | null;
    RenderAfter: JSX.Element;
}> = ({ isAuthenticated, RenderAfter }) => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.pageYOffset > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return isAuthenticated === null ? (
        <div className="flex-wrapper">
            <Loading />
        </div>
    ) : (
        <Fragment>
            <header
                className={classNames(
                    classes['top-header'],
                    isScrolled && classes.darkened
                )}
            >
                <Layout className={classes['top-header__layout']}>
                    <Logo />
                    <Navigation />
                    {isAuthenticated ? <MyCartButton /> : <AuthLinks />}
                </Layout>
            </header>
            <MainBlock>
                <Layout>{RenderAfter}</Layout>
            </MainBlock>
        </Fragment>
    );
};

export default TopHeader;
