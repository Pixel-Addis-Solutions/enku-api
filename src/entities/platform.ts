import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToMany,
  } from "typeorm";
import { Post } from "./post";
@Entity()
export class Platform extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string; // Platform name (e.g., "Facebook", "Twitter")

  @ManyToMany(() => Post, (post) => post.platforms)
  posts!: Post[]; // Many-to-Many relationship with Post
}
