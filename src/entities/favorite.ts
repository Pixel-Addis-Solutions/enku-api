import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Customer } from "./customer"
import { Product } from "./product"
import { ProductVariation } from "./product-variation"

@Entity()
export class Favorite {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    description!: string;

    @ManyToOne(() => Customer)
    customer!: Customer;

    @ManyToOne(() => Product)
    product!: Product;

    @ManyToOne(() => ProductVariation, { nullable: true })
    variation!: ProductVariation;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 