import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { ProductsService } from './products.service';

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategory])],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
