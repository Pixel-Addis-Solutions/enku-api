import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToMany,
 } from "typeorm";
import { Post } from "./post";
@Entity()
export class Hashtag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", unique: true })
  tag!: string; // Hashtag text (e.g., "#technology")

  @ManyToMany(() => Post, (post) => post.hashtags)
  posts!: Post[]; // Many-to-Many relationship with Post
}
