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

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  customer!: Customer;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items!: OrderItem[];

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total!: number;

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
