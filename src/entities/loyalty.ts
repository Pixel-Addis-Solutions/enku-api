import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user"; // Assuming you have a User entity
import { LoyaltyProgram } from "./loyalty-program";


@Entity()
export class LoyaltyPoints {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.loyaltyPoints, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => LoyaltyProgram, (loyaltyProgram) => loyaltyProgram.id)
  loyaltyProgram!: LoyaltyProgram;

  @Column({ type: "int" })
  points!: number;

  @Column({ type: "text" })
  reason!: string;

  @CreateDateColumn({ type: "timestamp" })
  awardedAt!: Date;
}
