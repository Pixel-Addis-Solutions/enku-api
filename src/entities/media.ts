import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import {Post} from "./post";
@Entity()
export class Media extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  url!: string; // Media URL (e.g., image or video link)

  @ManyToOne(() => Post, (post) => post.media, { onDelete: "CASCADE" })
  post!: Post; // Many-to-One relationship with Post
}
