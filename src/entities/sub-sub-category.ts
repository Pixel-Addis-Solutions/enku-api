// src/entities/sub-sub-category.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { SubCategory } from "./sub-category";
import { Category } from "./category";
import { Product } from "./product";

@Entity()
export class SubSubCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.subSubCategories,{nullable:false})
  subCategory!: SubCategory;
  @ManyToOne(() => Category, (Category) => Category.subSubCategories,{nullable:false})
  category!: Category;

  @ManyToOne(() => Product, (product) => product.subSubCategory)
  products!: Product;
}
