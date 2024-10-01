import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Discount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  type!: string; // e.g., percentage, fixed amount, bundle, BOGO

  @Column({ type: "float" })
  value!: number; // Discount value (e.g., 10% or $5 off)

  @Column({ type: "timestamp" })
  start_date!: Date;

  @Column({ type: "timestamp" })
  end_date!: Date;

  @Column({ type: "varchar", default: "active" })
  status!: string; // Active or inactive

  @Column({ type: "varchar", nullable: true })
  code!: string; // Promo code (e.g., 'SAVE20')

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
 