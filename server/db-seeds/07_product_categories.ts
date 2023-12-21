import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('product_categories').del();

    // Inserts seed entries
    await knex('product_categories').insert([
        {
            category: 'Ігрові консолі',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/consoles.png',
        },
        {
            category: 'Ноутбуки',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/laptops.png',
        },
        {
            category: "Персональні комп'ютери",
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/personal-computers.png',
        },
        {
            category: 'Планшети',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/tablets.png',
        },
        {
            category: 'Смартфони',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/smartphones.png',
        },
        {
            category: 'HDD',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/hdd.png',
        },
        {
            category: 'SSD',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/ssd.png',
        },
        {
            category: 'Процесори',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/processors.png',
        },
        {
            category: 'Відеокарти',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/gpus.png',
        },
        {
            category: "Оперативна пам'ять",
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/ram.png',
        },
        {
            category: 'Монітори',
            preview_url:
                'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/monitors.png',
        },
        {
            category: 'Дрони',
            preview_url: 'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/drones.png'
        }
    ]);
}
