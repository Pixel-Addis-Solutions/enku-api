import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
  } from "typeorm";

  @Entity()
  export class Review {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @Column({ unique: true })
    name!: string;
  

  }
  