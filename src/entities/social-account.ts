import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { User } from "./user"

@Entity()
export class SocialAccount {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: "CASCADE" })
     user!: User;

    @Column({ type: "varchar", length: 255 })
    platform!: string;

    @Column({ type: "varchar", length: 255 })
    accountName!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    accountId!: string;

    @Column({ type: "text" })
    accessToken!: string;

    @Column({ type: "uuid" })
    platformUserId!: string;

    @Column({ type: "timestamp", nullable: true })
    tokenExpiration!: Date | null;

    @Column({ type: "text", nullable: true })
    refreshToken!: string | null;

    @Column({ default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
    
    @UpdateDateColumn()
    updatedAt!: Date;
}
