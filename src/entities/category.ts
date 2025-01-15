import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { SubCategory } from "./sub-category";
import { Product } from "./product";
import { SubSubCategory } from "./sub-sub-category";
import { Filter, FilterValue } from "./filter";
import { Discount } from "./discount";
import { BaseEntity } from "./base-entity";

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
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

  @ManyToMany(() => Discount, (discount) => discount.products)
  discounts!: Discount[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
