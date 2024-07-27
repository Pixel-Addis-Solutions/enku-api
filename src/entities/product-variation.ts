import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Product } from "./product";
import { OptionValue } from "./option-value";
import { ProductImage } from "./product-image";
import { CartItem } from "./cart-item";

@Entity()
export class ProductVariation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  title?: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  price!: number;

  @Column()
  quantity!: number;

  @ManyToOne(() => Product, (product) => product.variations)
  product!: Product;

  @OneToMany(() => OptionValue, (optionValue) => optionValue.variation)
  optionValues!: OptionValue[];
  @OneToMany(() => ProductImage, (image) => image.variation)
  images!: ProductImage[];

  @OneToMany(() => CartItem, (item) => item.product)
  items!: CartItem[];

}
