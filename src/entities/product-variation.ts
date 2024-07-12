import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Product } from "./product";
import { ProductVariationOption } from "./product-variation-option";

@Entity()
export class ProductVariation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  sku?: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  additional_price?: number;

  @Column()
  stock_quantity!: number;

  @ManyToOne(() => Product, product => product.variations)
  product!: Product;

  @OneToMany(() => ProductVariationOption, variationOption => variationOption.variation)
  variationOptions!: ProductVariationOption[];
}
