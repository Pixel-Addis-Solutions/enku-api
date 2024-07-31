import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
  } from "typeorm";
  import { Cart } from "./cart";
  import { Product } from "./product";
  import { ProductVariation } from "./product-variation";
  
  @Entity()
  export class CartItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @ManyToOne(() => Cart, (cart) => cart.items)
    cart!: Cart;
  
    @ManyToOne(() => Product)
    product!: Product;
  
    @ManyToOne(() => ProductVariation, { nullable: true })
    variation?: ProductVariation; // Associated variation of the product
  
    @Column()
    quantity!: number;
  }
  