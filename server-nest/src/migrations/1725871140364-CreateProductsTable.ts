import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1725871140364 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS products (
                "id" SERIAL PRIMARY KEY,
                "title" VARCHAR(200) NOT NULL,
                "price" NUMERIC(9, 2) NOT NULL CHECK ("price" > 0),
                "initialImageUrl" VARCHAR(300) NOT NULL,
                "additionalImageUrl" VARCHAR(300) NOT NULL,
                "quantityInStock" SMALLINT NOT NULL CHECK ("quantityInStock" >= 0),
                "shortDescription" VARCHAR(300) NOT NULL,
                "maxOrderQuantity" SMALLINT NOT NULL DEFAULT 32767 CHECK ("maxOrderQuantity" > 0),
                "categoryId" INTEGER NOT NULL REFERENCES product_categories (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE products');
    }
}
