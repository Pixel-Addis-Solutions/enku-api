// src/entities/sub-sub-category.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SubCategory } from "./sub-category";
import { Category } from "./category";
import { Product } from "./product";

@Entity()
export class SubSubCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.subSubCategories)
  subCategory!: SubCategory;
  @ManyToOne(() => Category, (Category) => Category.subSubCategories)
  category!: Category;

  @ManyToOne(() => Product, (product) => product.subSubCategory)
  products!: Product;
}
