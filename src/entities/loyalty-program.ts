import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class LoyaltyProgram {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text", unique: true })
  action!: string; // e.g., 'purchase', 'review', 'referral'

  @Column({ type: "int" })
  points!: number;
  
  @Column({ type: "text" })
  reason!: string;

  @Column({ type: "boolean", default: true })
  active!: boolean;
}
