import { Query, Resolver } from '@nestjs/graphql';
import { ProductInfoWithoutReviews } from 'src/graphql-types';
import { ProductsService } from './products.service';

@Resolver()
export class ProductsResolver {
    constructor(private readonly productsService: ProductsService) {}

    @Query('featuredProducts')
    async getFeaturedProducts(): Promise<ProductInfoWithoutReviews[]> {
        return this.productsService.getFeaturedProducts();
    }
}
