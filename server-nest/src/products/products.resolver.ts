import {
    Args,
    Context,
    Info,
    Mutation,
    Query,
    Resolver,
} from '@nestjs/graphql';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import * as graphqlFields from 'graphql-fields';
import {
    ProductInfoWithoutReviews,
    ProductInfoWithReviews,
} from 'src/graphql-types';
import { ProductsService } from './products.service';
import { REQUEST_USER_AUTH_FIELD } from 'src/common/common.constants';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload.interface';
import { ProductCategoryPipe } from './pipes/product-category.pipe';
import { ProductPagePipe } from './pipes/product-page.pipe';
import { ProductIdPipe } from './pipes/product-id.pipe';
import { ProductReviewPipe } from './pipes/product-review.pipe';
import { StarRatingPipe } from './pipes/star-rating.pipe';
import { TypeORMError } from 'typeorm';

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

    @Query('products')
    async getProductsByPage(
        @Args('category', ProductCategoryPipe) category: string,
        @Args('page', ProductPagePipe) page: number
    ): Promise<{
        productList: ProductInfoWithoutReviews[];
        totalPages: number;
    }> {
        return this.productsService.getProductsByPage(category, page);
    }

    @Mutation('addProductReview')
    async addProductReview(
        @Args('productId', ProductIdPipe) productId: number,
        @Args('reviewMessage', ProductReviewPipe) reviewMessage: string,
        @Args('starRating', StarRatingPipe) starRating: number,
        @Context(REQUEST_USER_AUTH_FIELD) user: AccessTokenPayload | null
    ) {
        if (user === null) {
            throw new GraphQLError(
                'User must be authenticated to perform this action'
            );
        }

        try {
            await this.productsService.addReview({
                productId,
                reviewMessage,
                starRating,
                userId: user.id,
            });
            return { productId, userId: user.id };
        } catch (e) {
            if (
                e instanceof TypeORMError &&
                e.message.includes(
                    'duplicate key value violates unique constraint'
                )
            ) {
                throw new GraphQLError(
                    'Only one review per user is allowed for each product'
                );
            }
            throw e;
        }
    }
}
