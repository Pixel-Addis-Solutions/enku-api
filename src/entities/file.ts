import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class File{
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column()
  originalName!: string;

  @Column({ nullable: true })
  size!: string;

  @CreateDateColumn()
  createdDate!: Date;
  @UpdateDateColumn()
  updatedDate!: Date;
}
