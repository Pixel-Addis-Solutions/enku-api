import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from "typeorm";
import { SubCategory } from "./sub-category";
import { Product } from "./product";
import { SubSubCategory } from "./sub-sub-category";
import { Filter, FilterValue } from "./filter";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;
  @Column({ type: "text", nullable: true })
  description!: string;
  @ManyToOne(() => Product, (product) => product.category)
  products!: Product;

  @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
  subCategories!: SubCategory[];
  @OneToMany(() => SubSubCategory, (subSubcategory) => subSubcategory.category)
  subSubCategories!: SubSubCategory[];

  @ManyToMany(() => Filter, (filter) => filter.categories)
  filters!: Filter[];
  @ManyToMany(() => FilterValue, (filterValue) => filterValue.categories)
  filterValues!: FilterValue[];
}
