import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1724414244975 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS users (
                "id" SERIAL PRIMARY KEY,
                "email" VARCHAR(254) UNIQUE NOT NULL,
                "password" VARCHAR(72) NOT NULL,
                "firstName" VARCHAR(50) NOT NULL,
                "lastName" VARCHAR(50) NOT NULL,
                "isActivated" BOOLEAN NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE users');
    }
}
