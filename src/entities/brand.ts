import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product';

@Entity()
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ nullable: true })
  isFeatured?: boolean;

  @OneToMany(() => Product, (product) => product.brand)
  products!: Product[];
} 
