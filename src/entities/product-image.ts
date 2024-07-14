// src/entities/product-image.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product';
import { ProductVariation } from './product-variation';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
    url!: string;
 
  @ManyToOne(() => Product, (product) => product.images)
    product!: Product;

  @ManyToOne(() => ProductVariation, (variation) => variation.images, { nullable: true })
    variation!: ProductVariation;
}
