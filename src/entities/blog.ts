import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Blog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "text" })
  description!: string;
   
  @Column({ type: "text", nullable: true })
  content!: string;

  @Column()
  type!: string; // tip,video,tutorial .....card
  
  @Column()
  status!: string; // draft,approved,active,inactive

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
