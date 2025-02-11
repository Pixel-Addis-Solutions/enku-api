import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  } from "typeorm";
import { Media } from "./media";
import { Platform } from "./platform";
import { Hashtag } from "./hashtag";
@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  content!: string; // Post content

  @Column({ type: "enum", enum: ["draft", "scheduled", "published"], default: "draft" })
  status!: "draft" | "scheduled" | "published"; // Post status

  @Column({ type: "timestamp", nullable: true })
  scheduleTime!: Date | null; // Optional schedule time

  @OneToMany(() => Media, (media) => media.post, { cascade: true })
  media!: Media[]; // One-to-Many with Media

  @ManyToMany(() => Platform, (platform) => platform.posts, { cascade: true })
  @JoinTable()
  platforms!: Platform[]; // Many-to-Many with Platform

  @ManyToMany(() => Hashtag, (hashtag) => hashtag.posts, { cascade: true })
  @JoinTable()
  hashtags!: Hashtag[]; // Many-to-Many with Hashtag

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
