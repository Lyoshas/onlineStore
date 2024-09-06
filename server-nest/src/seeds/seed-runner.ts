import dataSource from '../../ormconfig';
import { ProductCategorySeeder } from './seed-files/01-product-categories';
import { Seedable } from './interfaces/seedable.interface';

async function seedDatabase() {
    await dataSource.initialize();

    const queryRunner = dataSource.createQueryRunner();
    const seeders: Seedable[] = [new ProductCategorySeeder()];

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
