import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  BaseEntity,
} from "typeorm";
import { Product } from "./product";
import { Category } from "./category";
import { ProductVariation } from "./product-variation";
import { Discount } from "./discount";

@Entity()
export class ProductDiscounts extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Discount, (discount) => discount.id, { nullable: false })
  discount!: Discount;

  @ManyToOne(() => Product, (product) => product.id, { nullable: true })
  product!: Product;

  @ManyToOne(() => Category, (category) => category.id, { nullable: true })
  category!: Category;

  @ManyToOne(() => ProductVariation, (variation) => variation.id, {
    nullable: true,
  })
  variation!: ProductVariation;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  discountedPrice!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  appliedAt!: Date;
}
