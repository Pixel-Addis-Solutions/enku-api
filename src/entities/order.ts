import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Customer } from "./customer";
import { OrderItem } from "./order-item";
import { BaseEntity } from "./base-entity";
import { Discount } from "./discount";
@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer!: Customer;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items!: OrderItem[];

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;
  @ManyToOne(() => Discount, { nullable: true, onDelete: "SET NULL" })
  discount!: Discount | null; // Optional discount applied to the order
  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  shippingPhoneNumber!: string;

  @Column({ nullable: true })
  shippingAddress!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  customerName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
