ALTER TABLE "business_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "saved_estimates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_materials" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "equipment_specs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_documents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_locations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_notes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "customers" CASCADE;--> statement-breakpoint
DROP TABLE "equipment_specs" CASCADE;--> statement-breakpoint
DROP TABLE "project_documents" CASCADE;--> statement-breakpoint
DROP TABLE "service_locations" CASCADE;--> statement-breakpoint
DROP TABLE "site_notes" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'lead'::text;--> statement-breakpoint
DROP TYPE "public"."project_status";--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('lead', 'quoted', 'won', 'lost', 'completed');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'lead'::"public"."project_status";--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE "public"."project_status" USING "status"::"public"."project_status";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "legal_business_name";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "tax_id_ein";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "state_license_number";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "insurance_provider";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "support_email";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "support_phone";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "billing_address";--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN "timezone";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "service_location_id";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "description";--> statement-breakpoint
CREATE POLICY "business_profiles_select_member" ON "business_profiles" AS PERMISSIVE FOR SELECT TO public USING (is_business_member(business_id));--> statement-breakpoint
CREATE POLICY "business_profiles_insert_owner_only" ON "business_profiles" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "business_profiles_update_owner_only" ON "business_profiles" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "business_profiles_delete_owner_only" ON "business_profiles" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "businesses_select_member" ON "businesses" AS PERMISSIVE FOR SELECT TO public USING (is_business_member(id));--> statement-breakpoint
CREATE POLICY "businesses_insert_owner_only" ON "businesses" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "businesses_update_owner_only" ON "businesses" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "businesses_delete_owner_only" ON "businesses" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "memberships_select_member" ON "memberships" AS PERMISSIVE FOR SELECT TO public USING (is_business_member(business_id));--> statement-breakpoint
CREATE POLICY "memberships_insert_owner_only" ON "memberships" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "memberships_update_owner_only" ON "memberships" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "memberships_delete_owner_only" ON "memberships" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "saved_estimates_select_member" ON "saved_estimates" AS PERMISSIVE FOR SELECT TO public USING (is_business_member(business_id));--> statement-breakpoint
CREATE POLICY "saved_estimates_insert_member" ON "saved_estimates" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "saved_estimates_update_owner_or_creator" ON "saved_estimates" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "saved_estimates_delete_owner_or_creator" ON "saved_estimates" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "user_materials_select_member" ON "user_materials" AS PERMISSIVE FOR SELECT TO public USING (is_business_member(business_id));--> statement-breakpoint
CREATE POLICY "user_materials_insert_member" ON "user_materials" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "user_materials_update_owner_only" ON "user_materials" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "user_materials_delete_owner_only" ON "user_materials" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
DROP TYPE "public"."lead_source";--> statement-breakpoint
DROP TYPE "public"."property_type";