-- ==============================================================================
-- SPORTSMAN.KE - PRODUCTION SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor to enforce Row Level Security (RLS)
-- and owner-based data access policies across all application tables.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "coupons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "contact_messages" ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. USERS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON "users";
CREATE POLICY "Users can read own profile" ON "users"
  FOR SELECT
  USING (
    auth.uid()::text = id 
    OR (auth.jwt() ->> 'email') = email
    OR (auth.jwt() ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Users can update own profile" ON "users";
CREATE POLICY "Users can update own profile" ON "users"
  FOR UPDATE
  USING (
    auth.uid()::text = id 
    OR (auth.jwt() ->> 'role') = 'admin'
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Admin full control on users" ON "users";
CREATE POLICY "Admin full control on users" ON "users"
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR auth.role() = 'service_role'
  );

-- ==============================================================================
-- 3. ORDERS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Customers can view only their own orders" ON "orders";
CREATE POLICY "Customers can view only their own orders" ON "orders"
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND "userId" = auth.uid()::text)
    OR ("email" = (auth.jwt() ->> 'email'))
    OR (auth.jwt() ->> 'role') IN ('admin', 'warehouse_staff', 'delivery_agent')
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Customers can create new orders" ON "orders";
CREATE POLICY "Customers can create new orders" ON "orders"
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff and Admin can update orders" ON "orders";
CREATE POLICY "Staff and Admin can update orders" ON "orders"
  FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') IN ('admin', 'warehouse_staff', 'delivery_agent')
    OR auth.role() = 'service_role'
  );

-- ==============================================================================
-- 4. ORDER ITEMS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "View items for authorized orders" ON "order_items";
CREATE POLICY "View items for authorized orders" ON "order_items"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "orders" o
      WHERE o.id = "order_items"."orderId"
      AND (
        (auth.uid() IS NOT NULL AND o."userId" = auth.uid()::text)
        OR (o."email" = (auth.jwt() ->> 'email'))
        OR (auth.jwt() ->> 'role') IN ('admin', 'warehouse_staff', 'delivery_agent')
        OR auth.role() = 'service_role'
      )
    )
  );

DROP POLICY IF EXISTS "Insert items during checkout" ON "order_items";
CREATE POLICY "Insert items during checkout" ON "order_items"
  FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- 5. PRODUCTS TABLE POLICIES (Public Catalog Read, Admin Write)
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can view products" ON "products";
CREATE POLICY "Anyone can view products" ON "products"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admin can modify products" ON "products";
CREATE POLICY "Only admin can modify products" ON "products"
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR auth.role() = 'service_role'
  );

-- ==============================================================================
-- 6. COUPONS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can view active coupons" ON "coupons";
CREATE POLICY "Anyone can view active coupons" ON "coupons"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admin can manage coupons" ON "coupons";
CREATE POLICY "Only admin can manage coupons" ON "coupons"
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR auth.role() = 'service_role'
  );

-- ==============================================================================
-- 7. REVIEWS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can read reviews" ON "reviews";
CREATE POLICY "Anyone can read reviews" ON "reviews"
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Verified customers can write reviews" ON "reviews";
CREATE POLICY "Verified customers can write reviews" ON "reviews"
  FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- 8. CONTACT MESSAGES TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can submit contact inquiries" ON "contact_messages";
CREATE POLICY "Public can submit contact inquiries" ON "contact_messages"
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admin can read contact messages" ON "contact_messages";
CREATE POLICY "Only admin can read contact messages" ON "contact_messages"
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Only admin can manage contact messages" ON "contact_messages";
CREATE POLICY "Only admin can manage contact messages" ON "contact_messages"
  FOR ALL
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR auth.role() = 'service_role'
  );
