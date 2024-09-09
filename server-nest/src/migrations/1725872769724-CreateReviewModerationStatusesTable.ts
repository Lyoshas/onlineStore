import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewModerationStatusesTable1725872769724
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS review_moderation_statuses (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(10) NOT NULL UNIQUE
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE review_moderation_statuses');
    }
}
