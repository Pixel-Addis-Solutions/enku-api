import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string;  // You might use a hashed password if needed

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
