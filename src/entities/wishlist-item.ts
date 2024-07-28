import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Wishlist } from "./wishlist";
import { Product } from "./product";
import { ProductVariation } from "./product-variation";

@Entity()
export class WishlistItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Product, (product) => product.id)
  productId!: string;

  @ManyToOne(() => ProductVariation, { nullable: true })
  variation?: ProductVariation; // Associated variation of the product

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items)
  wishlist!: Wishlist;
}
