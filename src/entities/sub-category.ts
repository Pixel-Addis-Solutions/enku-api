import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Category } from "./category";

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Category, category => category.subCategories)
  category!: Category;

  @Column()
  name!: string;
}
