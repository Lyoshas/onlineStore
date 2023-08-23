import dbPool from '../../services/postgres.service.js';

// this function checks whether the specified image is used for any product in the database
const isProductImageUsed = async (imageUrl: string): Promise<boolean> => {
    const { rows } = await dbPool.query(
        'SELECT 1 FROM products WHERE initial_image_url = $1 OR additional_image_url = $1',
        [imageUrl]
    );

    return rows.length > 0;
};

export default isProductImageUsed;
