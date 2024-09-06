import { EntityManager } from 'typeorm';
import { ProductCategory } from '../../products/entities/product-category.entity';
import { Seedable } from '../interfaces/seedable.interface';

export class ProductCategorySeeder implements Seedable {
    async seed(manager: EntityManager): Promise<void> {
        await manager.clear(ProductCategory);
        await manager.insert(ProductCategory, [
            {
                category: 'Ігрові консолі',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/consoles.png',
            },
            {
                category: 'Ноутбуки',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/laptops.png',
            },
            {
                category: "Персональні комп'ютери",
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/personal-computers.png',
            },
            {
                category: 'Планшети',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/tablets.png',
            },
            {
                category: 'Смартфони',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/smartphones.png',
            },
            {
                category: 'HDD',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/hdd.png',
            },
            {
                category: 'SSD',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/ssd.png',
            },
            {
                category: 'Процесори',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/processors.png',
            },
            {
                category: 'Відеокарти',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/gpus.png',
            },
            {
                category: "Оперативна пам'ять",
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/ram.png',
            },
            {
                category: 'Монітори',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/monitors.png',
            },
            {
                category: 'Дрони',
                previewUrl:
                    'https://onlinestore-react-assets.s3.amazonaws.com/product-categories/drones.png',
            },
        ]);
    }
}
