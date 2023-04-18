import { FC, Fragment, useState, useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { useMediaQuery } from 'react-responsive';

import classes from './TopHeader.module.css';
import Logo from './Logo/Logo';
import Navigation from './Navigation/Navigation';
import HeaderButtons from './HeaderButtons/HeaderButtons';
import Loading from '../UI/Loading/Loading';
import MainBlock from './MainBlock/MainBlock';
import Layout from '../Layout/Layout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import HamburgerMenuIcon from './HambugerMenuIcon/HamburgerMenuIcon';

// "isAuthenticated: null" means that the client hasn't sent the request yet
const TopHeader: FC<{
    RenderAfter: JSX.Element;
}> = ({ RenderAfter }) => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [showResponsiveMenu, setShowResponsiveMenu] = useState<boolean>(true);
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const shouldResetResponsiveMenu = useMediaQuery({
        query: '(min-width: 940px)',
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.pageYOffset > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useLayoutEffect(() => {
        if (shouldResetResponsiveMenu) setShowResponsiveMenu(true);
        else setShowResponsiveMenu(false);
    }, [shouldResetResponsiveMenu]);

    const handleHamburgerClick = () => setShowResponsiveMenu((prev) => !prev);

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
                    <Logo className={classes['top-header-layout__logo']} />
                    <HamburgerMenuIcon onClick={handleHamburgerClick} />
                    {showResponsiveMenu && (
                        <Fragment>
                            <Navigation
                                className={
                                    classes['top-header-layout__navigation']
                                }
                            />
                            <HeaderButtons isAuth={isAuthenticated} />
                        </Fragment>
                    )}
                </Layout>
            </header>
            <MainBlock>
                <Layout>{RenderAfter}</Layout>
            </MainBlock>
        </Fragment>
    );
};

export default TopHeader;
