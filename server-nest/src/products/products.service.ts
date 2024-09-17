import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { ProductInfoWithoutReviews } from 'src/graphql-types';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewModerationStatus } from './entities/product-review-moderation-status.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
    private static FEATURED_PRODUCTS_TO_FETCH = 12;

    constructor(
        @InjectRepository(ProductCategory)
        private readonly productCategoryRepository: Repository<ProductCategory>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
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

    async getFeaturedProducts(): Promise<ProductInfoWithoutReviews[]> {
        const featuredProducts = await this.productRepository
            .createQueryBuilder('product')
            .select('*')
            .from((qb) => {
                return qb
                    .subQuery()
                    .select([
                        'product.id',
                        'product.title',
                        'product.price',
                        'productCategory.category',
                        'product.initialImageUrl',
                        'product.additionalImageUrl',
                        'product.shortDescription',
                        'product.quantityInStock',
                    ])
                    .from(Product, 'product')
                    .addSelect((qb) => {
                        return (
                            qb
                                .subQuery()
                                // rounding "starRating" to the nearest 0.5
                                .select(
                                    '(ROUND(AVG(productReview.starRating) * 2) / 2)::DECIMAL(2, 1)'
                                )
                                .from(ProductReview, 'productReview')
                                .innerJoin(
                                    ProductReviewModerationStatus,
                                    'reviewModerationStatus',
                                    'reviewModerationStatus.id = productReview.moderationStatusId'
                                )
                                .where('productReview.productId = product.id')
                                .andWhere(
                                    'reviewModerationStatus.name = :moderationStatusName',
                                    { moderationStatusName: 'approved' }
                                )
                        );
                    }, 'userRating')
                    .innerJoin(
                        ProductCategory,
                        'productCategory',
                        'productCategory.id = product.categoryId'
                    )
                    .orderBy('"userRating"', 'DESC');
            }, 'featuredProducts')
            // "userRating" was declared in the SELECT statement, so in order
            // to use it in the WHERE clause, we need to wrap the entire query
            // in a subquery and apply the WHERE condition in the outer query
            // where 'userRating' is already defined.
            // The reason is that the FROM clause is executed first, then WHERE,
            // and only then SELECT
            .where('"featuredProducts"."userRating" IS NOT NULL')
            .limit(ProductsService.FEATURED_PRODUCTS_TO_FETCH)
            .getRawMany();

        return featuredProducts.map((product) => ({
            id: product.product_id,
            title: product.product_title,
            price: +product.product_price,
            initialImageUrl: product.product_initialImageUrl,
            additionalImageUrl: product.product_additionalImageUrl,
            shortDescription: product.product_shortDescription,
            category: product.productCategory_category,
            userRating: +product.userRating,
            isAvailable: this.isProductAvailable(
                product.product_quantityInStock
            ),
            isRunningOut: this.isProductRunningOut(
                product.product_quantityInStock
            ),
        }));
    }

    private isProductAvailable(quantityInStock: number): boolean {
        return quantityInStock > 0;
    }

    private isProductRunningOut(quantityInStock: number): boolean {
        return quantityInStock <= 5;
    }
}
