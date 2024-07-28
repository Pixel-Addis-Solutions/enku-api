import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './customer';
import { WishlistItem } from './wishlist-item';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @ManyToOne(() => Customer, (customer) => customer.id)
    customerId!: string;

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.wishlist)
    items!: WishlistItem[];

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}
