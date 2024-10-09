import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class HomePageCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "string" })
  title!: string;  // Card title, e.g., "New Skincare Line"

  @Column({ type: "text" })
  description!: string;  // Brief description about the content

  @Column({ type: "text", nullable: true })
  imageUrl!: string;  // Image for the card

  @Column({ type: "string" })
  type!: string;  // Type of card, e.g., "product", "category", "promotion", etc.

  @Column({ type: "text" })
  redirectUrl!: string;  // URL to redirect when the card is clicked

  @Column({ type: 'boolean', default: true })
  active!: boolean;
}
