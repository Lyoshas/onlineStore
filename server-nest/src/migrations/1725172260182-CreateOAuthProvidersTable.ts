import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOAuthProvidersTable1725172260182
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS oauth_providers (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(20) UNIQUE NOT NULL
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE oauth_providers');
    }
}
