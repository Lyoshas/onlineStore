import dotenv from 'dotenv';
import path from 'path';

export default () => {
    dotenv.config({
        path: path.join(process.cwd(), 'src', 'config', 'dev.env')
    });
};
