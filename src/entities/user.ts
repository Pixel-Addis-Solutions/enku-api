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
import { SocialAccount } from "./social-account";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  fullName!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 100, unique: true, nullable: true })
  phoneNumber!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @ManyToOne(() => Role, (role) => role.users)
  role!: Role;

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user, {
    cascade: true,
    eager: true,
  })
  socialAccounts!: SocialAccount[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}