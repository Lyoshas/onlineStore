import {
    Check,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';

@Entity('products')
@Check('"maxOrderQuantity" > 0')
@Check('"price" > 0')
@Check('"quantityInStock" >= 0')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 200, nullable: false })
    title: string;

    @Column({ type: 'numeric', precision: 9, scale: 2, nullable: false })
    price: number;

    @Column({ type: 'varchar', length: 300, nullable: false })
    initialImageUrl: string;

    @Column({ type: 'varchar', length: 300, nullable: false })
    additionalImageUrl: string;

    @Column({ type: 'smallint', nullable: false })
    quantityInStock: number;

    @Column({ type: 'varchar', length: 300, nullable: false })
    shortDescription: string;

    @Column({ type: 'smallint', nullable: false, default: 32767 })
    maxOrderQuantity: number;

    @ManyToOne(
        () => ProductCategory,
        (productCategory) => productCategory.products,
        {
            nullable: false,
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        }
    )
    category: ProductCategory[];
}
