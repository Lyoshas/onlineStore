import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    DataSource,
    EntityManager,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { GraphQLError } from 'graphql';
import { ProductCategory } from './entities/product-category.entity';
import {
    ProductInfoWithoutReviews,
    ProductInfoWithReviews,
} from 'src/graphql-types';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewModerationStatus } from './entities/product-review-moderation-status.entity';
import { Product } from './entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/env-schema';

const userRatingSubquery = (qb: SelectQueryBuilder<any>) => {
    return (
        qb
            .subQuery()
            // rounding "starRating" to the nearest 0.5
            // e.g. 3, 3.5, 4, 4.5, 5
            .select('(ROUND(AVG(review.starRating) * 2) / 2)::DECIMAL(3, 2)')
            .from(ProductReview, 'review')
            .innerJoin(
                ProductReviewModerationStatus,
                'moderationStatus',
                'moderationStatus.id = review.moderationStatusId'
            )
            .where('review.productId = product.id')
            .andWhere('moderationStatus.name = :moderationStatus', {
                moderationStatus: 'approved',
            })
    );
};

@Injectable()
export class ProductsService {
    private static FEATURED_PRODUCTS_TO_FETCH = 12;

    constructor(
        @InjectRepository(ProductCategory)
        private readonly productCategoryRepository: Repository<ProductCategory>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly configService: ConfigService<EnvironmentVariables>,
        private readonly dataSource: DataSource
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

    // if the provided user id is "null", the "userCanAddReview" field won't be returned
    async getProduct(
        productId: number,
        userId: number | null
    ): Promise<
        Omit<ProductInfoWithReviews, 'userCanAddReview'> & {
            userCanAddReview?: boolean;
        }
    > {
        // Example of a SQL query that will be generated by TypeORM
        /*
        SELECT
            "product"."id" AS "product_id",
            "product"."title" AS "product_title",
            "product"."price" AS "product_price",
            "product"."initialImageUrl" AS "product_initialImageUrl",
            "product"."additionalImageUrl" AS "product_additionalImageUrl",
            "product"."quantityInStock" AS "product_quantityInStock",
            "product"."shortDescription" AS "product_shortDescription",
            "productCategory"."category" AS "productCategory_category",
            (
                SELECT COUNT(*) = 0
                FROM "product_reviews" "productReview"
                WHERE "productReview"."productId" = "product"."id"
                    AND "productReview"."userId" = $1
            ) AS "userCanAddReview",
            (
                SELECT (ROUND(AVG("review"."starRating") * 2) / 2)::DECIMAL(3, 2)
                FROM "product_reviews" "review"
                INNER JOIN "review_moderation_statuses" "moderationStatus"
                    ON "moderationStatus"."id" = "review"."moderationStatusId"
                WHERE "review"."productId" = "product"."id"
                    AND "moderationStatus"."name" = $2
            ) AS "userRating",
            (
                SELECT json_agg(t)
                FROM (
                    SELECT
                        "review"."userId" AS "review_userId",
                        "review"."reviewMessage" AS "review_reviewMessage",
                        "review"."starRating" AS "review_starRating",
                        "review"."createdAt" AS "review_createdAt",
                        CONCAT("user"."firstName", ' ', "user"."lastName") AS "fullName"
                    FROM "product_reviews" "review"
                    INNER JOIN "review_moderation_statuses" "moderationStatus"
                        ON "moderationStatus"."id" = "review"."moderationStatusId"
                    INNER JOIN "users" "user"
                        ON "user"."id" = "review"."userId"
                    WHERE "review"."productId" = "product"."id"
                        AND "moderationStatus"."name" = $3
                    ORDER BY "review_createdAt" DESC
                ) "t"
            ) AS "userReviews"
        FROM "products" "product"
        INNER JOIN "product_categories" "productCategory"
            ON "productCategory"."id" = "product"."categoryId"
        WHERE "product"."id" = $4;
        */

        let productQueryBuilder = this.productRepository
            .createQueryBuilder('product')
            .select([
                'product.id',
                'product.title',
                'product.price',
                'product.initialImageUrl',
                'product.additionalImageUrl',
                'product.shortDescription',
                'product.quantityInStock',
                'productCategory.category',
            ]);
        if (userId !== null) {
            productQueryBuilder = productQueryBuilder.addSelect((qb) => {
                return qb
                    .subQuery()
                    .select('COUNT(*) = 0')
                    .from(ProductReview, 'productReview')
                    .where('productReview.productId = product.id')
                    .andWhere('productReview.userId = :userId', { userId });
            }, 'userCanAddReview');
        }
        productQueryBuilder = productQueryBuilder
            .addSelect(userRatingSubquery, 'userRating')
            .addSelect((qb) => {
                return qb
                    .subQuery()
                    .select('json_agg(t)')
                    .from((qb) => {
                        return qb
                            .subQuery()
                            .select([
                                'review.reviewMessage',
                                'review.starRating',
                                'review.createdAt',
                                'review.userId',
                                'CONCAT(user.firstName, \' \', user.lastName) AS "fullName"',
                            ])
                            .from(ProductReview, 'review')
                            .innerJoin(
                                ProductReviewModerationStatus,
                                'moderationStatus',
                                'moderationStatus.id = review.moderationStatusId'
                            )
                            .innerJoin(User, 'user', 'user.id = review.userId')
                            .where('review.productId = product.id')
                            .andWhere('moderationStatus.name = :status', {
                                status: 'approved',
                            })
                            .orderBy('review.createdAt', 'DESC');
                    }, 't');
            }, 'userReviews')
            .innerJoin(
                ProductCategory,
                'productCategory',
                'productCategory.id = product.categoryId'
            )
            .where('product.id = :productId', { productId });

        const product = await productQueryBuilder.getRawOne<{
            product_id: number;
            product_title: string;
            product_price: string;
            product_initialImageUrl: string;
            product_additionalImageUrl: string;
            product_quantityInStock: number;
            product_shortDescription: string;
            productCategory_category: string;
            userCanAddReview: boolean;
            userRating: string;
            userReviews: {
                review_userId: number;
                review_reviewMessage: string;
                review_starRating: number;
                review_createdAt: string;
                fullName: string;
            }[];
        }>();

        if (!product) {
            throw new GraphQLError(
                'A product with the specified id does not exist'
            );
        }

        return {
            id: product.product_id,
            title: product.product_title,
            price: +product.product_price,
            initialImageUrl: product.product_initialImageUrl,
            additionalImageUrl: product.product_additionalImageUrl,
            category: product.productCategory_category,
            shortDescription: product.product_shortDescription,
            userRating: +product.userRating,
            userCanAddReview: product.userCanAddReview,
            isAvailable: this.isProductAvailable(
                product.product_quantityInStock
            ),
            isRunningOut: this.isProductAvailable(
                product.product_quantityInStock
            ),
            reviews: product.userReviews.map((review) => ({
                userId: review.review_userId,
                fullName: review.fullName,
                reviewMessage: review.review_reviewMessage,
                starRating: review.review_starRating,
                createdAt: new Date(review.review_createdAt).toLocaleDateString(
                    'uk-UA'
                ),
            })),
        };
    }

    async getProductsByPage(
        category: string,
        page: number
    ): Promise<{
        productList: ProductInfoWithoutReviews[];
        totalPages: number;
    }> {
        let productList: ProductInfoWithoutReviews[] = [];
        let totalPages: number = 0;

        await this.dataSource.manager.transaction(
            async (transactionalEntityManager) => {
                productList = await this.getProducts({
                    category,
                    page,
                    entityManager: transactionalEntityManager,
                });
                totalPages = await this.getTotalNumberOfPages({
                    category,
                    entityManager: transactionalEntityManager,
                });
            }
        );

        return { productList, totalPages };
    }

    private async getProducts({
        category,
        page,
        entityManager,
    }: {
        category: string;
        page: number;
        entityManager: EntityManager;
    }): Promise<ProductInfoWithoutReviews[]> {
        /*
        Example of a SQL query that will be produced by TypeORM:
        SELECT
            "product"."id",
            "product"."title",
            "product"."price",
            "product"."initialImageUrl",
            "product"."additionalImageUrl",
            "product"."quantityInStock",
            "product"."shortDescription",
            "productCategory"."category",
            (
                SELECT (ROUND(AVG("review"."starRating") * 2) / 2)::DECIMAL(3, 2)
                FROM "product_reviews" "review"
                INNER JOIN "review_moderation_statuses" "moderationStatus"
                    ON "moderationStatus"."id" = "review"."moderationStatusId"
                WHERE "review"."productId" = "product"."id"
                    AND "moderationStatus"."name" = 'approved'
            ) AS "userRating"
        FROM "products" AS "product"
        INNER JOIN "product_categories" AS "productCategory"
            ON "productCategory"."id" = "product"."categoryId"
        WHERE "productCategory"."category" = 'Ноутбуки'
        ORDER BY "product"."id"
        OFFSET (2 - 1) * 3
        LIMIT 3;
        */
        const PRODUCTS_PER_PAGE =
            this.configService.get<number>('PRODUCTS_PER_PAGE')!;
        const products = await entityManager
            .createQueryBuilder()
            .select([
                'product.id',
                'product.title',
                'product.price',
                'product.initialImageUrl',
                'product.additionalImageUrl',
                'product.quantityInStock',
                'product.shortDescription',
                'productCategory.category',
            ])
            .addSelect(userRatingSubquery, 'userRating')
            .from(Product, 'product')
            .innerJoin(
                ProductCategory,
                'productCategory',
                'productCategory.id = product.categoryId'
            )
            .where('productCategory.category = :productCategory', {
                productCategory: category,
            })
            .orderBy('product.id')
            .offset((page - 1) * PRODUCTS_PER_PAGE)
            .limit(PRODUCTS_PER_PAGE)
            .getRawMany<{
                product_id: number;
                product_title: string;
                product_price: string;
                product_initialImageUrl: string;
                product_additionalImageUrl: string;
                product_quantityInStock: number;
                product_shortDescription: string;
                productCategory_category: string;
                userRating: string;
            }>();

        return products.map((product) => ({
            id: product.product_id,
            title: product.product_title,
            price: +product.product_price,
            category: product.productCategory_category,
            initialImageUrl: product.product_initialImageUrl,
            additionalImageUrl: product.product_additionalImageUrl,
            shortDescription: product.product_shortDescription,
            isAvailable: this.isProductAvailable(
                product.product_quantityInStock
            ),
            isRunningOut: this.isProductRunningOut(
                product.product_quantityInStock
            ),
            userRating: +product.userRating,
        }));
    }

    private async getTotalNumberOfPages({
        category,
        entityManager,
    }: {
        category: string;
        entityManager: EntityManager;
    }): Promise<number> {
        /*
        Example of a SQL query that will be produced by TypeORM
        SELECT CEIL(COUNT(*)::FLOAT / 3)
        FROM "products" AS "product"
        INNER JOIN "product_categories" AS "productCategory"
            ON "productCategory"."id" = "product"."categoryId"
        WHERE "productCategory"."category" = 'Ноутбуки';
        */
        const query = await entityManager
            .createQueryBuilder()
            .select('CEIL(COUNT(*)::FLOAT / :productsPerPage)', 'totalPages')
            .setParameter(
                'productsPerPage',
                this.configService.get<number>('PRODUCTS_PER_PAGE')
            )
            .from(Product, 'product')
            .innerJoin(
                ProductCategory,
                'productCategory',
                'productCategory.id = product.categoryId'
            )
            .where('productCategory.category = :category', { category })
            .getRawOne<{ totalPages: number }>();

        return query!.totalPages;
    }
}
