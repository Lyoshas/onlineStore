import { FC, Fragment } from 'react';
import { useParams } from 'react-router-dom';

import classes from './ActivateAccount.module.css';
import Card from '../../components/UI/Card/Card';
import Loading from '../../components/UI/Loading/Loading';
import useFetch from '../../components/hooks/useFetch';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';

const ActivateAccount: FC = () => {
    const { activationToken } = useParams<{ activationToken: string }>();
    const {
        isRequestLoading,
        wasRequestSuccessful,
        JSONResponse,
        unexpectedRequestError,
    } = useFetch(
        `/api/auth/activate-account/${activationToken}`,
        { method: 'PATCH' },
        200
    );

    return (
        <div className="flex-wrapper">
            <Card className={classes['activation-block']}>
                {isRequestLoading && <Loading color="#273c99" />}
                {!isRequestLoading && (
                    <Fragment>
                        <img
                            src={
                                wasRequestSuccessful
                                    ? '/success-icon.svg'
                                    : '/error-icon.png'
                            }
                            className={classes.icon}
                            alt={`${
                                wasRequestSuccessful ? 'Success' : 'Error'
                            } icon`}
                        />
                        <p className={classes.message}>
                            {wasRequestSuccessful
                                ? 'The account has been activated.'
                                : JSONResponse?.error || unexpectedRequestError}
                        </p>
                        <ButtonLink
                            to={`${wasRequestSuccessful ? '/sign-in' : '/'}`}
                        >
                            {wasRequestSuccessful ? 'Sign In' : 'Home Page'}
                        </ButtonLink>
                    </Fragment>
                )}
            </Card>
        </div>
    );
};

export default ActivateAccount;
