import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { Category } from "./category";
import { Brand } from "./brand";
import { ProductVariation } from "./product-variation";
import { ProductImage } from "./product-image";
import { SubCategory } from "./sub-category";
import { SubSubCategory } from "./sub-sub-category";
import { CartItem } from "./cart-item";
import { FilterValue } from "./filter";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("increment")
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
  imageUrl!: string;
 
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

  @OneToMany(() => ProductVariation, (variation) => variation.product)
  variations!: ProductVariation[];

  @OneToMany(() => CartItem, (item) => item.product)
  items!: CartItem[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images!: ProductImage[];

  @ManyToMany(() => FilterValue, (filterValue) => filterValue.products)
  filters!: FilterValue[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
