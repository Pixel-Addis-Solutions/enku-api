import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Testimonial {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ length: 50 })
  type!: string;

  @Column({ type: "text" })
  content!: string;
}
