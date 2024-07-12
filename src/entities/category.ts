import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SubCategory } from "./sub-category";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;
  @Column({ type: "text", nullable: true })
  description!: string;

  @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
  subCategories!: SubCategory[];
}
