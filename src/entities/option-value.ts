import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Option } from "./option";
import { ProductVariation } from "./product-variation";

@Entity()
export class OptionValue {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  value!: string;

  @ManyToOne(() => Option, (option) => option.optionValues)
  option!: Option;

  @ManyToOne(() => ProductVariation, (variation) => variation.optionValues)
  variation!: ProductVariation;
}
