import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Category } from "./category";
import { SubCategory } from "./sub-category";
import { ProductVariation } from "./product-variation";
import { ProductOption } from "./product-option";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("text", { nullable: true })
  description?: string;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @ManyToOne(() => SubCategory, { nullable: true })
  @JoinColumn({ name: "sub_category_id" })
  subcategory?: SubCategory;

  @Column("decimal", { precision: 10, scale: 2 })
  base_price!: number;

  @Column("date")
  production_date!: string;

  @Column("date")
  expiry_date!: string;

  @Column("text", { nullable: true })
  ingredient_list?: string;

  @Column("text", { nullable: true })
  instructions?: string;

  @Column("varchar", { length: 100, nullable: true })
  origin?: string;

  @Column("varchar", { length: 100, nullable: true })
  use_for?: string;

  @Column("boolean", { nullable: true })
  certified?: boolean;

  @Column("text", { nullable: true })
  offer_package?: string;

  @Column("varchar", { length: 100, nullable: true })
  age_group?: string;

  @Column("varchar", { length: 100, nullable: true })
  scent?: string;

  @OneToMany(() => ProductVariation, (variation) => variation.product)
  variations!: ProductVariation[];
  @OneToMany(() => ProductOption, (variation) => variation.options)
  options!: ProductOption[];
}
