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
import { Product } from "./product";

// Filter Entity
@Entity()
export class Filter {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @OneToMany(() => FilterValue, (filterValue) => filterValue.filter)
  values!: FilterValue[];

  @ManyToMany(() => Category, (category) => category.filters)
  @JoinTable()
  categories!: Category[];
}

// FilterValue Entity
@Entity()
export class FilterValue {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  value!: string;

  @ManyToOne(() => Filter, (filter) => filter.values)
  filter!: Filter;

  @ManyToMany(() => Product, (product) => product.filters)
  @JoinTable()
  products!: Product[];
  
  @ManyToOne(() => Category, (category) => category.filterValues)
  category!: Category;
 
}

