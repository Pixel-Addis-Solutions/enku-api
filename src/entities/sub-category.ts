import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Category } from "./category";
import { SubSubCategory } from "./sub-sub-category";
import { Product } from "./product";

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Product, (product) => product.subCategory)
  products!: Product;

  @ManyToOne(() => Category, (category) => category.subCategories)
  category!: Category;

  @OneToMany(
    () => SubSubCategory,
    (subSubCategory) => subSubCategory.subCategory,
    { nullable: false }
  )
  subSubCategories!: SubSubCategory[];
  @Column()
  name!: string;
}
