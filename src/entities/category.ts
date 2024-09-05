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
  @PrimaryGeneratedColumn("increment")
  id!: string;

  @Column()
  name!: string;
  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ nullable: true })
  isFeatured?: boolean;

  @Column({ type: "varchar", length: 255 })
  imageUrl!: string;
 
  @ManyToOne(() => Product, (product) => product.category)
  products!: Product;

  @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
  subCategories!: SubCategory[];
  @OneToMany(() => SubSubCategory, (subSubcategory) => subSubcategory.category)
  subSubCategories!: SubSubCategory[];

  @ManyToMany(() => Filter, (filter) => filter.categories)
  filters!: Filter[];
  @OneToMany(() => FilterValue, (filterValue) => filterValue.category)
  filterValues!: FilterValue[];
}
