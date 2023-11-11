// PostgreSQL stores products in this format
export default interface DBProduct {
    id: number;
    title: string;
    price: number;
    initial_image_url: string;
    additional_image_url: string;
    quantity_in_stock: number;
    short_description: string;
    category_id: number;
    max_order_quantity: number;
}
