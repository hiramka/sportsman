import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Entities
import { User } from './entities/User.entity';
import { Product } from './entities/Product.entity';
import { Order } from './entities/Order.entity';
import { OrderItem } from './entities/OrderItem.entity';
import { Coupon } from './entities/Coupon.entity';

dotenv.config();

const dbType = (process.env.DB_TYPE || 'postgres') as 'postgres' | 'sqlite';
const useSsl = process.env.DB_SSL === 'true';

export const AppDataSource = new DataSource(
  dbType === 'postgres'
    ? {
        type: 'postgres',
        ...(process.env.DATABASE_URL
          ? { url: process.env.DATABASE_URL }
          : {
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT || '5432', 10),
              username: process.env.DB_USERNAME || 'postgres',
              password: process.env.DB_PASSWORD || 'postgres',
              database: process.env.DB_DATABASE || 'sportsman',
            }),
        entities: [User, Product, Order, OrderItem, Coupon],
        migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
        synchronize: false,
        logging: true,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'sqlite',
        database: process.env.DB_PATH || './data/sportsman.db',
        entities: [User, Product, Order, OrderItem, Coupon],
        migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
        synchronize: true,
        logging: false,
      },
);

export default AppDataSource;
