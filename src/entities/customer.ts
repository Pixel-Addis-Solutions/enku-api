import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "./order";
import { LoyaltyPoints } from "./loyalty";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 15, unique: true })
  phoneNumber!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  fullName!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password!: string; // You might use a hashed password if needed

  @OneToMany(() => LoyaltyPoints, (loyaltyPoint) => loyaltyPoint.customer)
  loyaltyPoints!: LoyaltyPoints[];

  @OneToMany(() => Order, (order) => order.customer)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
