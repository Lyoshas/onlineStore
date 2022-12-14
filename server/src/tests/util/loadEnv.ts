import dotenv from 'dotenv';

export default () => {
    dotenv.config({
        path: '/app/src/config/dev.env'
    });
};
