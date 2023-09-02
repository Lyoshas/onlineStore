import CamelCaseProperties from './CamelCaseProperties';
import DBProduct from './DBProduct';

interface AdditionalAttributes {
    isAvailable: boolean;
    isRunningOut: boolean;
}

// make each property camelCase, omit 'quantityInStock' and 'maxOrderQuantity' and add { isAvailable: boolean; isRunningOut: boolean; }
type DisplayProduct = Omit<
    CamelCaseProperties<DBProduct>,
    'quantityInStock' | 'maxOrderQuantity'
> &
    AdditionalAttributes;

export default DisplayProduct;
