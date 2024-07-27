import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { CartItem } from "./cart-item"; // Ensure you create a CartItem entity
  
  @Entity()
  export class Cart {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @Column({ type: "varchar", length: 255, nullable: true })
    sessionId?: string; // For non-logged-in users
  
    @Column({ type: "varchar", length: 255, nullable: true })
    customerId?: string; // For logged-in users
  
    @OneToMany(() => CartItem, (item) => item.cart)
    items!: CartItem[];
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }
  