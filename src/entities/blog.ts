import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "string" })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "string", nullable: true })
  image!: string;

  @Column({ type: "string" })
  type!: string;
  @Column({ type: "string" })
  status!: string; // draft,approved,active,inactive

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}