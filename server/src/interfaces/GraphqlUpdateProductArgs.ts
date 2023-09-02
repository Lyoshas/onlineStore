import GraphqlAddProductsArgs from './GraphqlAddProductArgs';

type GraphqlUpdateProductArgs = GraphqlAddProductsArgs & {
    id: number;
    maxOrderQuantity: number;
};

export default GraphqlUpdateProductArgs;
