import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';

    if (isPostgres) {
      // 1. Create Users Table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "email" character varying NOT NULL,
          "phone" character varying NOT NULL,
          "passwordHash" character varying NOT NULL,
          "role" character varying NOT NULL DEFAULT 'customer',
          "isVerified" boolean NOT NULL DEFAULT false,
          "verificationToken" character varying,
          "createdAt" character varying,
          CONSTRAINT "UQ_users_email" UNIQUE ("email"),
          CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_phone" ON "users" ("phone")`);

      // 2. Create Products Table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "products" (
          "id" character varying NOT NULL,
          "name" character varying NOT NULL,
          "category" character varying NOT NULL,
          "description" text,
          "price" double precision NOT NULL,
          "stockQuantity" integer NOT NULL,
          "reorderThreshold" integer NOT NULL DEFAULT 3,
          "brand" character varying NOT NULL,
          "imageUrl" text,
          "warehouseLocation" character varying,
          CONSTRAINT "PK_products_id" PRIMARY KEY ("id")
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_category" ON "products" ("category")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_brand" ON "products" ("brand")`);

      // 3. Create Coupons Table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "coupons" (
          "id" character varying NOT NULL,
          "code" character varying NOT NULL,
          "discountPercentage" integer NOT NULL,
          "description" text,
          CONSTRAINT "UQ_coupons_code" UNIQUE ("code"),
          CONSTRAINT "PK_coupons_id" PRIMARY KEY ("id")
        )
      `);

      // 4. Create Orders Table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "orders" (
          "id" character varying NOT NULL,
          "userId" uuid,
          "customerName" character varying NOT NULL,
          "email" character varying NOT NULL,
          "phone" character varying NOT NULL,
          "deliveryAddress" text NOT NULL,
          "subCounty" character varying NOT NULL,
          "subtotal" double precision NOT NULL,
          "discountAmount" double precision NOT NULL DEFAULT 0,
          "totalAmount" double precision NOT NULL,
          "couponApplied" character varying,
          "status" character varying NOT NULL,
          "paymentMethod" character varying NOT NULL,
          "mpesaReference" character varying,
          "mpesaCheckoutRequestId" character varying,
          "trackingNumber" character varying,
          "courierName" character varying,
          "date" character varying NOT NULL,
          "signature" text,
          "timelineJson" text NOT NULL DEFAULT '[]',
          CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
          CONSTRAINT "FK_orders_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_email" ON "orders" ("email")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_phone" ON "orders" ("phone")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON "orders" ("status")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_date" ON "orders" ("date")`);

      // 5. Create Order Items Table
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "order_items" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "quantity" integer NOT NULL,
          "price" double precision NOT NULL,
          "order_id" character varying,
          "product_id" character varying,
          CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
          CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id")
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_items_order_id" ON "order_items" ("order_id")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_items_product_id" ON "order_items" ("product_id")`);

    } else {
      // SQLite Implementation
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" varchar PRIMARY KEY NOT NULL,
          "name" varchar NOT NULL,
          "email" varchar UNIQUE NOT NULL,
          "phone" varchar NOT NULL,
          "passwordHash" varchar NOT NULL,
          "role" varchar NOT NULL DEFAULT ('customer'),
          "isVerified" boolean NOT NULL DEFAULT (0),
          "verificationToken" varchar,
          "createdAt" varchar
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_phone" ON "users" ("phone")`);

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "products" (
          "id" varchar PRIMARY KEY NOT NULL,
          "name" varchar NOT NULL,
          "category" varchar NOT NULL,
          "description" text,
          "price" float NOT NULL,
          "stockQuantity" integer NOT NULL,
          "reorderThreshold" integer NOT NULL DEFAULT (3),
          "brand" varchar NOT NULL,
          "imageUrl" text,
          "warehouseLocation" varchar
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_category" ON "products" ("category")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_brand" ON "products" ("brand")`);

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "coupons" (
          "id" varchar PRIMARY KEY NOT NULL,
          "code" varchar UNIQUE NOT NULL,
          "discountPercentage" integer NOT NULL,
          "description" text
        )
      `);

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "orders" (
          "id" varchar PRIMARY KEY NOT NULL,
          "userId" varchar,
          "customerName" varchar NOT NULL,
          "email" varchar NOT NULL,
          "phone" varchar NOT NULL,
          "deliveryAddress" text NOT NULL,
          "subCounty" varchar NOT NULL,
          "subtotal" float NOT NULL,
          "discountAmount" float NOT NULL DEFAULT (0),
          "totalAmount" float NOT NULL,
          "couponApplied" varchar,
          "status" varchar NOT NULL,
          "paymentMethod" varchar NOT NULL,
          "mpesaReference" varchar,
          "mpesaCheckoutRequestId" varchar,
          "trackingNumber" varchar,
          "courierName" varchar,
          "date" varchar NOT NULL,
          "signature" text,
          "timelineJson" text NOT NULL DEFAULT ('[]'),
          FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_email" ON "orders" ("email")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_phone" ON "orders" ("phone")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON "orders" ("status")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_orders_date" ON "orders" ("date")`);

      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "order_items" (
          "id" varchar PRIMARY KEY NOT NULL,
          "quantity" integer NOT NULL,
          "price" float NOT NULL,
          "order_id" varchar,
          "product_id" varchar,
          FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE,
          FOREIGN KEY ("product_id") REFERENCES "products" ("id")
        )
      `);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_items_order_id" ON "order_items" ("order_id")`);
      await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_order_items_product_id" ON "order_items" ("product_id")`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coupons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
