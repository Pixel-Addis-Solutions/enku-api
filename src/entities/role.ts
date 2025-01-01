import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Permission } from "./permission";
import { User } from "./user";

@Entity()
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable:true })
  description!: string;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  updatedDate!: Date;

  @ManyToMany(() => Permission)
  @JoinTable() // This will automatically create the 'role_permissions' pivot table
  permissions!: Permission[];
}
