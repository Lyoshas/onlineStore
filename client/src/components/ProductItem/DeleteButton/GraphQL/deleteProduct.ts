import { gql } from '../../../../__generated__';

const DELETE_PRODUCT = gql(`
    mutation DeleteProduct($deleteProductId: Int!) {
        deleteProduct(id: $deleteProductId) {
            id         
        }
    }
`);

export default DELETE_PRODUCT;
