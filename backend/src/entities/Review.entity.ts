import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Product } from './Product.entity';

@Entity('reviews')
export class Review {
  @PrimaryColumn()
  id: string;

  @Column()
  @Index()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  userName: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ type: 'int' })
  rating: number; // 1 to 5 stars

  @Column({ type: 'text' })
  comment: string;

  @Column()
  createdAt: string;
}
