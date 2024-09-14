import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CarouselItem } from './carousel-item';

@Entity()
export class Carousel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    status!: boolean;

    @Column()
    device!: 'mobile' | 'pc';

    @OneToMany(() => CarouselItem, item => item.carousel, { cascade: true })
    items!: CarouselItem[];
}
