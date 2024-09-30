import {
	Check,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryColumn,
} from 'typeorm';
import { ProductReviewModerationStatus } from './product-review-moderation-status.entity';
import { Product } from './product.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('product_reviews')
@Check('"starRating" >= 1 AND "starRating" <= 5')
export class ProductReview {
	@PrimaryColumn({ type: 'integer' })
	productId: number;

	@PrimaryColumn({ type: 'integer' })
	userId: number;

	@Column({ type: 'varchar', length: 2000, nullable: false })
	reviewMessage: string;

	@Column({ type: 'numeric', precision: 2, scale: 1, nullable: false })
	starRating: number;

	@ManyToOne(() => Product, (product) => product.productReviews, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
		nullable: false,
	})
	product: Product;

	@ManyToOne(() => User, (user) => user.id, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
		nullable: false,
	})
	user: User;

	@ManyToOne(
		() => ProductReviewModerationStatus,
		(productReviewModerationStatus) =>
			productReviewModerationStatus.productReviews,
		{
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			nullable: false,
		}
	)
	moderationStatus: ProductReviewModerationStatus;

	@CreateDateColumn()
	createdAt: Date;
}
