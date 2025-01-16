import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import { Post } from "./post";
import  { Platform } from "./platform";
@Entity()
export class PostLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  post!: Post; // Logs are linked to a specific Post

  @ManyToOne(() => Platform, { onDelete: "CASCADE" })
  platform!: Platform; // Logs track the publishing platform

  @Column({ type: "timestamp" })
  attemptTime!: Date; // Time of the publish attempt

  @Column({ type: "boolean" })
  success!: boolean; // Whether the publish attempt was successful

  @Column({ type: "varchar", nullable: true })
  errorMessage!: string | null; // Error message if the publish failed
}
