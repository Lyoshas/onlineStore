import { FC, Fragment, useState, useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';

import classes from './TopHeader.module.css';
import Logo from './Logo/Logo';
import Navigation from './Navigation/Navigation';
import HeaderButtons from './HeaderButtons/HeaderButtons';
import MainBlock from './MainBlock/MainBlock';
import Layout from '../Layout/Layout';
import { RootState } from '../../store';
import HamburgerMenuIcon from './HambugerMenuIcon/HamburgerMenuIcon';
import LoadingScreen from '../UI/LoadingScreen/LoadingScreen';

// "isAuthenticated: null" means that the client hasn't sent the request yet
const TopHeader: FC<{
    RenderAfter: JSX.Element;
    // since the top header has 'position: fixed', every sibling of the header will "overlap" with the heder
    // if "props.addOffset" is set to true, a new block will be added that will be adjusted such that the "RenderAfter" element is visible
    // by default props.addOffset will be set to false
    addOffset: boolean;
}> = ({ RenderAfter, addOffset = false }) => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [showResponsiveMenu, setShowResponsiveMenu] = useState<boolean>(true);
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const isLargeScreen = useMediaQuery({ query: `(min-width: 1351px)` });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.pageYOffset > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useLayoutEffect(() => {
        if (isLargeScreen) setShowResponsiveMenu(true);
        else setShowResponsiveMenu(false);
    }, [isLargeScreen]);

    const handleHamburgerClick = () => setShowResponsiveMenu((prev) => !prev);
    const handleNavItemClick = () => {
        if (isLargeScreen) return;
        setShowResponsiveMenu(false);
    };

    return isAuthenticated === null ? (
        <LoadingScreen />
    ) : (
        <Fragment>
            <header
                className={classNames(
                    classes['top-header'],
                    classes['basic-user'],
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
                                onNavItemClick={handleNavItemClick}
                            />
                            <HeaderButtons isAuth={isAuthenticated} />
                        </Fragment>
                    )}
                </Layout>
            </header>
            <MainBlock
                className={
                    addOffset ? classes['position-adjustable-block'] : null
                }
            >
                {RenderAfter}
            </MainBlock>
        </Fragment>
    );
};

export default TopHeader;
