import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Role } from "./role";
import { LoyaltyPoints } from "./loyalty";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @ManyToOne(() => Role, (role) => role.users)
  role!: Role;

  @OneToMany(() => LoyaltyPoints, (loyaltyPoint) => loyaltyPoint.user)
  loyaltyPoints!: LoyaltyPoints[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
