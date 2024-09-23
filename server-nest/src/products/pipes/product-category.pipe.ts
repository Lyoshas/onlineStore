import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { GraphQLError } from 'graphql';

@Injectable()
export class ProductCategoryPipe implements PipeTransform {
    constructor(
        @InjectRepository(ProductCategory)
        private readonly productCategoryRepository: Repository<ProductCategory>
    ) {}

    async transform(value: string, metadata: ArgumentMetadata) {
        const categoryExists = await this.productCategoryRepository.existsBy({
            category: value,
        });
        if (categoryExists) return value;
        throw new GraphQLError('The specified category does not exist');
    }
}
