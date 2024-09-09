import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductReviewsTable1725873017208
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS product_reviews (
                "productId" INTEGER NOT NULL
                    REFERENCES products (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                "userId" INTEGER NOT NULL
                    REFERENCES users (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                "reviewMessage" VARCHAR(2000) NOT NULL,
                "starRating" NUMERIC(2, 1) NOT NULL
                    CHECK ("starRating" >= 1 AND "starRating" <= 5),
                "moderationStatusId" INTEGER NOT NULL
                    REFERENCES review_moderation_statuses (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                "createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("productId", "userId")
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE product_reviews`);
    }
}
