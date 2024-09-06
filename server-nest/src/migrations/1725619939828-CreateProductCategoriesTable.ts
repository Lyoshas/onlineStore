import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductCategoriesTable1725619939828
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS product_categories (
                "id" SERIAL PRIMARY KEY,
                "category" VARCHAR(30) UNIQUE NOT NULL,
                "previewUrl" VARCHAR(255) NOT NULL
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE product_categories`);
    }
}
