// takes a product's quantity and returns whether it's running out
// in this case if there are 5 products or less,
// this product is assummed to be running out
export default (quantityInStock: number) => {
    return quantityInStock <= 5;
};
