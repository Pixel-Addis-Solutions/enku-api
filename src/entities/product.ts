import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  BaseEntity,
} from "typeorm";
import { Category } from "./category";
import { Brand } from "./brand";
import { ProductVariation } from "./product-variation";
import { ProductImage } from "./product-image";
import { SubCategory } from "./sub-category";
import { SubSubCategory } from "./sub-sub-category";
import { CartItem } from "./cart-item";
import { FilterValue } from "./filter";
import { Discount } from "./discount";

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text" })
  ingredients!: string;

  @Column({ type: "text" })
  howToUse!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: "varchar", length: 255 })
  imageUrl!: string; // used for banner image
  @Column({ type: "enum", enum: ["active", "inactive"], default: "active" })
  status!: "active" | "inactive";

  @Column({ type: "date", nullable: true })
  productionDate!: string;

  @Column({ type: "date", nullable: true })
  expiryDate!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  origin?: string;

  @Column({ type: "boolean", nullable: true })
  certified?: boolean;

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ nullable: true })
  metaDescription?: string;

  @Column({ type: "text", nullable: true })
  metaKeywords?: string;

  @ManyToOne(() => Category, (category) => category.products)
  category!: Category;
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products)
  subCategory!: Category;

  @ManyToOne(() => SubSubCategory, (subSubCategory) => subSubCategory.products)
  subSubCategory!: SubSubCategory;

  @ManyToOne(() => Brand, (brand) => brand.products)
  brand!: Brand;

  @OneToMany(() => ProductVariation, (variation) => variation.product, {
    cascade: true,
    onDelete: "CASCADE",
  })
  variations!: ProductVariation[];

  @OneToMany(() => CartItem, (item) => item.product)
  items!: CartItem[];

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    onDelete: "CASCADE",
  })
  images!: ProductImage[];

  @ManyToMany(() => FilterValue, (filterValue) => filterValue.products)
  filters!: FilterValue[];

  @ManyToMany(() => Discount, (discount) => discount.products)
  discounts!: Discount[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
