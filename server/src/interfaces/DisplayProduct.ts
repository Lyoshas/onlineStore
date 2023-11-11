import CamelCaseProperties from './CamelCaseProperties';
import DBProduct from './DBProduct';

// make each property camelCase, omit 'quantityInStock' and 'maxOrderQuantity' and add { isAvailable: boolean; isRunningOut: boolean; }
type DisplayProduct = Omit<
    CamelCaseProperties<DBProduct>,
    'quantityInStock' | 'maxOrderQuantity' | 'categoryId'
> & {
    category: string;
    isAvailable: boolean;
    isRunningOut: boolean;
    isInTheCart: boolean;
}

export default DisplayProduct;
