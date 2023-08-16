import dbPool from '../services/postgres.service';
import extractS3ObjectFromURL from './extract-s3-object-from-url';

interface S3ObjectsHashTable {
    [s3ObjectKey: string]: true;
}

// this function returns an object whose keys are S3 object keys of all images that are associated with any product in the DB
// an object is returned to easily verify that a current S3 object is indeed associated with any product
// this way, this verification operation would take O(1) instead of O(n)
const getAllImagesFromDB = async (): Promise<S3ObjectsHashTable> => {
    let totalS3ObjectsInDB: S3ObjectsHashTable = {};
    // The SQL query below will combine the 'initial_image_url' and 'additional_image_url' columns into one. All duplicates will be removed
    /*
        Before:

        initial_image_url  |  additional_image_url
        ------------------------------------------
        image1.png         |  image2.png
        image3.png         |  image4.png

        After:

        image_url
        ---------
        image1.png
        image3.png
        image2.png
        image4.png
    */
    const { rows } = await dbPool.query<{ image_url: string }>(`
        SELECT initial_image_url AS image_url FROM products
        UNION
        SELECT additional_image_url as image_url FROM products
    `);

    rows.forEach((entry) => {
        // "initial_image_url" and "additional_image_url" are URLs pointing to images
        // we need to extract the image names only
        const objectKey = extractS3ObjectFromURL(entry.image_url);
        // this way if you want to verify if an S3 object is associated with any DB product, you just type "'objectkey.png' in totalObjectsInDB"
        // this object operation is O(1) instead of O(n) for arrays
        totalS3ObjectsInDB[objectKey] = true;
    });

    return totalS3ObjectsInDB;
};

export { S3ObjectsHashTable };

export default getAllImagesFromDB;
