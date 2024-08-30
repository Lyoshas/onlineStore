import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokensTable1725009946648 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS refresh_tokens (
                "id" SERIAL PRIMARY KEY,
                "token" VARCHAR(64) NOT NULL UNIQUE,
                "userId" INTEGER NOT NULL REFERENCES users (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                "expiresAt" TIMESTAMP NOT NULL
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE refresh_tokens`);
    }
}
