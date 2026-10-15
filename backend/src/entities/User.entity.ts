import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
import { Order } from './Order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Index()
  phone: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ default: 'customer' })
  role: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, select: false })
  verificationToken: string;

  @Column({ nullable: true, select: false })
  resetPasswordToken: string;

  @Column({ nullable: true, select: false })
  resetPasswordExpires: string;

  @Column({ nullable: true })
  createdAt: string;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}
