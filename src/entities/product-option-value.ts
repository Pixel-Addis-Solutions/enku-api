import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ProductOption } from "./product-option";

@Entity()
export class ProductOptionValue {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  value!: string;

  @ManyToOne(() => ProductOption, option => option.product)
  option!: ProductOption;
}
