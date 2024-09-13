import { EntityManager } from 'typeorm';
import { Seedable } from '../interfaces/seedable.interface';
import { ProductReviewModerationStatus } from 'src/products/entities/product-review-moderation-status.entity';
import { ProductReviewModerationStatusEnum } from 'src/products/enums/product-review-moderation-status.enum';

export class ProductReviewModerationStatusSeeder implements Seedable {
    async seed(manager: EntityManager): Promise<void> {
        await manager.delete(ProductReviewModerationStatus, {});
        await manager.insert(ProductReviewModerationStatus, [
            { name: ProductReviewModerationStatusEnum.PENDING },
            { name: ProductReviewModerationStatusEnum.APPROVED },
            { name: ProductReviewModerationStatusEnum.REJECTED },
        ]);
    }
}
