import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSizesAndOrderFields1700000000001 implements MigrationInterface {
  name = 'AddSizesAndOrderFields1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';

    if (isPostgres) {
      // 1. Products: sizes column
      await queryRunner.query(`
        ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sizes" text DEFAULT '["Standard"]';
      `);
      await queryRunner.query(`
        UPDATE "products" SET "sizes" = '["Standard"]' WHERE "sizes" IS NULL;
      `);

      // 2. Orders: county, shippingFee, exchangeRequestJson
      await queryRunner.query(`
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "county" character varying;
      `);
      await queryRunner.query(`
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingFee" double precision DEFAULT 0;
      `);
      await queryRunner.query(`
        ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "exchangeRequestJson" text;
      `);

      // 3. Order Items: selectedSize
      await queryRunner.query(`
        ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "selectedSize" character varying DEFAULT 'Standard';
      `);
      await queryRunner.query(`
        UPDATE "order_items" SET "selectedSize" = 'Standard' WHERE "selectedSize" IS NULL;
      `);

      // 4. Users: resetPasswordToken, resetPasswordExpires
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetPasswordToken" character varying;
      `);
      await queryRunner.query(`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetPasswordExpires" character varying;
      `);
    } else {
      // SQLite fallback: ignore errors if columns exist
      try {
        await queryRunner.query(`ALTER TABLE products ADD COLUMN sizes TEXT DEFAULT '["Standard"]'`);
      } catch (e) {}
      try {
        await queryRunner.query(`ALTER TABLE orders ADD COLUMN county VARCHAR`);
      } catch (e) {}
      try {
        await queryRunner.query(`ALTER TABLE orders ADD COLUMN shippingFee REAL DEFAULT 0`);
      } catch (e) {}
      try {
        await queryRunner.query(`ALTER TABLE orders ADD COLUMN exchangeRequestJson TEXT`);
      } catch (e) {}
      try {
        await queryRunner.query(`ALTER TABLE order_items ADD COLUMN selectedSize VARCHAR DEFAULT 'Standard'`);
      } catch (e) {}
      try {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN resetPasswordToken VARCHAR`);
      } catch (e) {}
      try {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN resetPasswordExpires VARCHAR`);
      } catch (e) {}
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';
    if (isPostgres) {
      await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "sizes"`);
      await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "county"`);
      await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "shippingFee"`);
      await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "exchangeRequestJson"`);
      await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "selectedSize"`);
      await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "resetPasswordToken"`);
      await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "resetPasswordExpires"`);
    }
  }
}
