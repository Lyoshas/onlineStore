import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as path from 'path';
import dataSource from '../../ormconfig';
import { ProductCategorySeeder } from './seed-files/01-product-categories';
import { Seedable } from './interfaces/seedable.interface';
import { ProductSeeder } from './seed-files/02-products';
import { UserRoleSeeder } from './seed-files/03-user-roles';
import { UserSeeder } from './seed-files/04-users';
import { PasswordService } from 'src/auth/password/password.service';
import { RandomService } from 'src/common/services/random.service';
import { BcryptService } from 'src/auth/hashing/bcrypt.service';
import { configModuleOptions } from 'src/config-service-options';

async function seedDatabase() {
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();

    // we need some services that are integrated in the NestJS application
    // instead of creating a completely new application instance, we can just
    // construct a new module that will incorporate all the necessary providers
    const moduleRef = await Test.createTestingModule({
        imports: [
            // initializing ConfigModule, which loads ConfigService, which,
            // in turn, loads environment variables
            ConfigModule.forRoot({
                ...configModuleOptions,
                envFilePath: path.join(__dirname, 'seeding.env'),
            }),
        ],
        providers: [PasswordService, BcryptService, RandomService],
    }).compile();

    const passwordService = moduleRef.get(PasswordService);
    const configService = moduleRef.get(ConfigService);
    const bcryptService = moduleRef.get(BcryptService);

    // the order of seeders is important
    const seeders: Seedable[] = [
        new ProductCategorySeeder(),
        new ProductSeeder(),
        new UserRoleSeeder(),
        new UserSeeder(passwordService, configService, bcryptService),
    ];

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        for (let seeder of seeders) {
            await seeder.seed(queryRunner.manager);
            console.log(`${seeder.constructor.name} was executed successfully`);
        }

        await queryRunner.commitTransaction();
    } catch (err) {
        console.log('Something went wrong. Rolling back...');
        console.error(err);
        await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
        await dataSource.destroy();
    }
}

seedDatabase();
