import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_categories')
export class ProductCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30, nullable: false, unique: true })
    category: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    previewUrl: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];
}
