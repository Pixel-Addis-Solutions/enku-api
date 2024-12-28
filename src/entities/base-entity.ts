import { BaseEntity as TypeORMBaseEntity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity extends TypeORMBaseEntity {
  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  creatorId?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  updaterId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;



}