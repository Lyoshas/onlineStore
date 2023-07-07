import DisplayProduct from './DisplayProduct';

type GraphqlAddProductsArgs = Omit<
    DisplayProduct,
    | 'id'
    | 'isAvailable'
    | 'isRunningOut'
    | 'initialImageUrl'
    | 'additionalImageUrl'
> & {
    quantityInStock: number;
    initialImageName: string;
    additionalImageName: string;
};

export default GraphqlAddProductsArgs;
