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

@Entity()
export class Discount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  type!: string; // e.g., percentage, fixed amount, bundle, BOGO

  @Column({ type: "float" })
  value!: number; // Discount value (e.g., 10% or $5 off)

  @Column()
  start_date!: Date;

  @Column()
  end_date!: Date;

  @Column({ type: "varchar", default: "active" })
  status!: string; // Active or inactive

  @Column({ type: "varchar", nullable: true })
  code!: string; // Promo code (e.g., 'SAVE20')

  @ManyToMany(() => Product, (product) => product.discounts)
  @JoinTable()
  products!: Product[];

  @ManyToMany(() => Category, (category) => category.discounts)
  @JoinTable()
  categories!: Category[];
  
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
