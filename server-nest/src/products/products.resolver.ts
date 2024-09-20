import { Args, Context, Info, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import * as graphqlFields from 'graphql-fields';
import {
    ProductInfoWithoutReviews,
    ProductInfoWithReviews,
} from 'src/graphql-types';
import { ProductsService } from './products.service';
import { REQUEST_USER_AUTH_FIELD } from 'src/common/common.constants';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload.interface';

@Resolver()
export class ProductsResolver {
    constructor(private readonly productsService: ProductsService) {}

    @Query('featuredProducts')
    async getFeaturedProducts(): Promise<ProductInfoWithoutReviews[]> {
        return this.productsService.getFeaturedProducts();
    }

    @Query('product')
    async getProduct(
        @Args('id') productId: number,
        @Context(REQUEST_USER_AUTH_FIELD) user: AccessTokenPayload | null,
        @Info() info: GraphQLResolveInfo
    ): Promise<
        Omit<ProductInfoWithReviews, 'userCanAddReview'> & {
            userCanAddReview?: boolean;
        }
    > {
        const requestedFields = graphqlFields(info);

        if ('userCanAddReview' in requestedFields && user === null) {
            throw new GraphQLError(
                'User must be authenticated to request the "userCanAddReview" field'
            );
        }

        return this.productsService.getProduct(productId, user?.id || null);
    }
}
