import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Carousel } from './carousel';

@Entity()
export class CarouselItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    image!: string;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    typeId!: number;

    @Column()
    status!: boolean;

    @ManyToOne(() => Carousel, carousel => carousel.items)
    carousel!: Carousel;
}
