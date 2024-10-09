import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class LoyaltyProgram {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  action!: string; // e.g., 'purchase', 'review', 'referral'

  @Column({ type: "int" })
  points!: number;
  
  @Column({ type: "text" })
  reason!: string;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @Column({ type: "decimal", default: 0 })
  thresholdAmount!: number; // Minimum amount required to qualify for points

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
