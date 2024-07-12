import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Role } from "./role";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @ManyToMany(() => Role, (role) => role.permissions, { cascade: true })
  roles!: Role[];
}
