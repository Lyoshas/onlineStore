import CamelCaseProperties from './CamelCaseProperties';
import DBProduct from './DBProduct';

interface AdditionalAttributes {
    isAvailable: boolean;
    isRunningOut: boolean;
}

// make each property camelCase, omit 'quantityInStock' and add { isAvailable: boolean; isRunningOut: boolean; }
type DisplayProduct = Omit<CamelCaseProperties<DBProduct>, 'quantityInStock'> &
    AdditionalAttributes;

export default DisplayProduct;
