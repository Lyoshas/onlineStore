import DisplayProduct from './DisplayProduct';

type GraphqlAddProductArgs = Omit<
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
    maxOrderQuantity: number | null | undefined;
};

export default GraphqlAddProductArgs;
