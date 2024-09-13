import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductCategory } from './entities/product-category.entity';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductReviewModerationStatus } from './entities/product-review-moderation-status.entity';
import { ProductReview } from './entities/product-review.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductCategory,
            Product,
            ProductReviewModerationStatus,
            ProductReview,
        ]),
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
