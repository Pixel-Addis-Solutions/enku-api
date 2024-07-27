import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./category";
import { Brand } from "./brand";
import { ProductVariation } from "./product-variation";
import { ProductImage } from "./product-image";
import { SubCategory } from "./sub-category";
import { SubSubCategory } from "./sub-sub-category";
import { CartItem } from "./cart-item";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text" })
  ingredients!: string;

  @Column({ type: "text" })
  how_to_use!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "varchar", length: 255 })
  imageUrl!: string;

  @Column({ type: "date" })
  productionDate!: string;

  @Column({ type: "date" })
  expiryDate!: string;

  @ManyToOne(() => Category, (category) => category.products)
  category!: Category;
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products)
  subCategory!: Category;

  @ManyToOne(() => SubSubCategory, (subSubCategory) => subSubCategory.products)
  subSubCategory!: SubSubCategory;

  @ManyToOne(() => Brand, (brand) => brand.products)
  brand!: Brand;

  @OneToMany(() => ProductVariation, (variation) => variation.product)
  variations!: ProductVariation[];

  @OneToMany(() => CartItem, (item) => item.product)
  items!: CartItem[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images!: ProductImage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
