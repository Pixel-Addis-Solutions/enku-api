import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Order } from './order';
  import { Product } from './product';
  import { ProductVariation } from './product-variation';
import { BaseEntity } from './base-entity';
  
  @Entity()
  export class OrderItem extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @ManyToOne(() => Order, (order) => order.items)
    order!: Order;
  
    @ManyToOne(() => Product)
    product!: Product;
  
    // @Column({nullable:true}) Removed @Column from the variation property. It should only have the @ManyToOne decorator
    @ManyToOne(() => ProductVariation)
    variation!: ProductVariation;
  
    @Column({ type: 'int' })
    quantity!: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }