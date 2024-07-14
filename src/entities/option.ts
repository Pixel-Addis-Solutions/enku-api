import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { OptionValue } from "./option-value";

@Entity()
export class Option {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @OneToMany(() => OptionValue, (optionValue) => optionValue.option)
  optionValues!: OptionValue[];
  
}
