import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsersTable1725006590596 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            ADD COLUMN "roleId" INTEGER NOT NULL
                REFERENCES user_roles (id)
                ON UPDATE CASCADE
                ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN "roleId";`);
    }
}
