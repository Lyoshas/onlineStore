import DisplayProduct from './DisplayProduct';

interface GetProductsByPageOutput {
    productList: Partial<DisplayProduct>[];
    totalPages: number;
}

export default GetProductsByPageOutput;
