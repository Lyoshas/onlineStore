import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOAuthStatesTable1725173012253 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS oauth_states (
                "id" SERIAL PRIMARY KEY,
                "state" VARCHAR(64) UNIQUE NOT NULL,
                "oauthProviderId" INTEGER NOT NULL
                    REFERENCES oauth_providers (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE oauth_states`);
    }
}
