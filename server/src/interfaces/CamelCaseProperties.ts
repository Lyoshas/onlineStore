import CamelCase from './CamelCase';

// traverses object keys and maps them into the camelCase format
// it can work with nested objects/arrays as well
// example:
/*
    type OrderInfo = {
        user_id: number;
        delivery_warehouse_description: string;
        user_profile: { first_name: string, last_name: string };
        order_products: { title: string; quantity_to_order: number }[];
    };

    "CamelCaseProperties<OrderInfo>" will produce this type:
    {
        userId: number;
        deliveryWarehouseDescription: string;
        userProfile: { firstName: string; lastName: string };
        orderProducts: { title: string; quantityToOrder: number }[]
    }
*/
type CamelCaseProperties<T> = {
    [key in keyof T as CamelCase<string & key>]: T[key] extends Array<
        infer NestedType
    >
        ? CamelCaseProperties<NestedType>[]
        : T[key] extends object
        ? CamelCaseProperties<T[key]>
        : T[key];
};

export default CamelCaseProperties;
