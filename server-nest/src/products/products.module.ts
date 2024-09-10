import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProductCategory, Product])],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
