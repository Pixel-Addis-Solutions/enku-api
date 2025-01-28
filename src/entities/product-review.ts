import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import { User } from "./user";
  import { Product } from "./product";
  import { ProductVariation } from "./product-variation";
  
  @Entity()
  export class ProductReview {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @JoinColumn({ name: "customerId" })
    customer!: User;
  
    @Column({ type: "uuid" })
    customerId!: string;
  
    @Column({ type: "text", nullable: false })
    comment!: string;
  
    @Column({ type: "float", nullable: false })
    rate!: number;
  
    @ManyToOne(() => Product, (product) => product.id, { nullable: false })
    @JoinColumn({ name: "productId" })
    product!: Product;
  
    @Column({ type: "uuid", nullable: false })
    productId!: string;
  
    @ManyToOne(() => ProductVariation, (variation) => variation.id, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "variationId" })
    variation!: ProductVariation;
  
    @Column({ type: "uuid", nullable: true })
    variationId!: string;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }