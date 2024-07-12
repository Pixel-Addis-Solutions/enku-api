import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { ProductVariation } from "./product-variation";
import { ProductOptionValue } from "./product-option-value";

@Entity()
export class ProductVariationOption {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => ProductVariation, variation => variation.variationOptions)
  variation!: ProductVariation;

  @ManyToOne(() => ProductOptionValue, optionValue => optionValue.option)
  optionValue!: ProductOptionValue;
}
