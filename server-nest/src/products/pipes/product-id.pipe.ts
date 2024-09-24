import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductIdPipe implements PipeTransform {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    ) {}

    async transform(value: number, metadata: ArgumentMetadata) {
        const existingProduct = await this.productRepository.existsBy({
            id: value,
        });
        if (existingProduct) return value;
        throw new GraphQLError(
            'A product with the specified id does not exist'
        );
    }
}
