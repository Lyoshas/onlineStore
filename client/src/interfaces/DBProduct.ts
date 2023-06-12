interface DBProduct {
    id: number;
    title: string;
    price: number;
    category: string;
    initialImageUrl: string;
    additionalImageUrl: string;
    quantityInStock: number;
    shortDescription: string;
}

export default DBProduct;
