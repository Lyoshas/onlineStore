import path from 'path';
import dotenv from 'dotenv';

export default () => {
    dotenv.config({ path: path.join(process.cwd(), 'src', 'config', '.env') });
};
