import { FC, Fragment, useState, useEffect } from 'react';
import classNames from 'classnames';

import classes from './TopHeader.module.css';
import Logo from './Logo/Logo';
import Navigation from './Navigation/Navigation';
import HeaderButtons from './HeaderButtons/HeaderButtons';
import Loading from '../UI/Loading/Loading';
import MainBlock from './MainBlock/MainBlock';
import Layout from '../Layout/Layout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// "isAuthenticated: null" means that the client hasn't sent the request yet
const TopHeader: FC<{
    RenderAfter: JSX.Element;
}> = ({ RenderAfter }) => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

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
                    <HeaderButtons isAuth={isAuthenticated} /> 
                </Layout>
            </header>
            <MainBlock>
                <Layout>{RenderAfter}</Layout>
            </MainBlock>
        </Fragment>
    );
};

export default TopHeader;
