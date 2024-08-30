import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRolesTable1725005303745 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS user_roles (
                "id" SERIAL PRIMARY KEY,
                "role" VARCHAR(30) NOT NULL UNIQUE
            );`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE user_roles');
    }
}
