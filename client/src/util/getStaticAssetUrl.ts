// this function generates a full URL to an S3 bucket that stores all the necessary static image assets
// important note: this function does not verify the existence of the specified image
// for example:
// getStaticAssetUrl('logo.svg') -> 'https://onlinestore-react-assets.s3.amazonaws.com/logo.svg'
const getStaticAssetUrl = (imageName: string) => {
    return `https://onlinestore-react-assets.s3.amazonaws.com/${imageName}`;
};

export default getStaticAssetUrl;
