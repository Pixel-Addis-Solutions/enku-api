import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Category } from "./category";
import { SubCategory } from "./sub-category";
import { SubSubCategory } from "./sub-sub-category";
import { Product } from "./product";

@Entity()
export class Filter {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @OneToMany(() => FilterValue, (filterValue) => filterValue.filter)
  values!: FilterValue[];
  @OneToMany(() => Category, (category) => category.filters)
  categories!: Category[];
}

@Entity()
export class FilterValue {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  value!: string;

  @ManyToOne(() => Filter, (filter) => filter.values)
  filter!: Filter;
}

@Entity()
export class CategoryFilter {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Category, (category) => category.filters)
  category!: Category;

//   @ManyToOne(() => SubCategory, (subCategory) => subCategory.filters)
//   subCategory!: SubCategory;

//   @ManyToOne(() => SubSubCategory, (subSubCategory) => subSubCategory.filters)
//   subSubCategory!: SubSubCategory;

  @ManyToOne(() => Filter, (filter) => filter.categories)
  filter!: Filter;
}
