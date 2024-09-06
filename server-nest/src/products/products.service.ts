import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(ProductCategory)
        private readonly productCategoryRepository: Repository<ProductCategory>
    ) {}

    async getProductCategories(): Promise<
        { name: string; previewURL: string }[]
    > {
        const categories = await this.productCategoryRepository.find({
            select: ['category', 'previewUrl'],
            order: { id: 'ASC' },
        });
        return categories.map((productCategory) => ({
            name: productCategory.category,
            previewURL: productCategory.previewUrl,
        }));
    }
}
