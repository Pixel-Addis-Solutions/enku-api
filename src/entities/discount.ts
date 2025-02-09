import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
} from "typeorm";
import { Product } from "./product";
import { Category } from "./category";
import { ProductVariation } from "./product-variation";

@Entity()
export class Discount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  type!: string; // make enum //   
  // e.g., percentage, fixed amount, bundle, BOGO

  @Column({ type: "float" })
  value!: number; // Discount value (e.g., 10% or $5 off)

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column({ default: false })
  status!: boolean; // Active or inactive

  @Column({ type: "varchar", nullable: true })
  code!: string; // Promo code (e.g., 'SAVE20')

  @Column({ type: "varchar", nullable: true })
  image!: string; 

  @ManyToMany(() => Product, (product) => product.discounts)
  @JoinTable()
  products!: Product[];

  @ManyToMany(() => ProductVariation, (variation) => variation.discounts)
  @JoinTable()
  variations!: ProductVariation[];

  @ManyToMany(() => Category, (category) => category.discounts)
  @JoinTable()
  categories!: Category[];
  
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}