import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductReview } from './product-review.entity';

@Entity('review_moderation_statuses')
export class ProductReviewModerationStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 10, nullable: false, unique: true })
    name: string;

    @OneToMany(
        () => ProductReview,
        (productReview) => productReview.moderationStatus
    )
    productReviews: ProductReview[];
}
