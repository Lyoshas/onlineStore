/**
 * Examples:
 * 1) getImageName("https://onlinestore-product-images.s3.eu-north-1.amazonaws.com/17bdd15e-190b-44a6-a555-93906d11df28.png") => "17bdd15e-190b-44a6-a555-93906d11df28.png"
 * 2) getImageName("/api/images/ff042894-a2d5-457d-b9b2-82f7cde46255.png") => "ff042894-a2d5-457d-b9b2-82f7cde46255.png"
 */
const getImageName = (imageURL: string): string => {
    const IMAGE_NAME_REGEX =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png/i;
    return imageURL.match(IMAGE_NAME_REGEX)![0];
};

export default getImageName;
