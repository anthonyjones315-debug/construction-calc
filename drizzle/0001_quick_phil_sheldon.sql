CREATE TYPE "public"."lead_source" AS ENUM('website', 'referral', 'google', 'facebook', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('lead', 'quoted', 'won', 'lost', 'completed', 'scheduled', 'in_progress');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('residential', 'commercial', 'industrial');--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"business_name" text,
	"business_phone" text,
	"business_email" text,
	"business_address" text,
	"business_website" text,
	"logo_url" text,
	"legal_business_name" text,
	"tax_id_ein" text,
	"state_license_number" text,
	"insurance_provider" text,
	"support_email" text,
	"support_phone" text,
	"billing_address" text,
	"timezone" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"business_id" uuid NOT NULL,
	"organization_id" uuid
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"join_code" text,
	"seat_limit" integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"primary_email" text,
	"primary_phone" text,
	"lead_source" "lead_source",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_signups" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'splash',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"consent_text" text,
	"consent_version" text,
	"consent_recorded_at" timestamp with time zone,
	"ip_address" text,
	"user_agent" text,
	"unsubscribed_at" timestamp with time zone,
	CONSTRAINT "email_signups_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "email_signups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "equipment_specs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"service_location_id" uuid NOT NULL,
	"system_type" text NOT NULL,
	"manufacturer" text,
	"model_number" text,
	"serial_number" text,
	"install_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"client_name" text NOT NULL,
	"client_email" text,
	"client_phone" text,
	"project_address" text,
	"source" text,
	"interest_score" numeric(5, 2),
	"notes" text,
	"status" text DEFAULT 'lead' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_business_id_user_id_key" UNIQUE("business_id","user_id"),
	CONSTRAINT "memberships_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'member'::text]))
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"plan_tier" text DEFAULT 'free' NOT NULL,
	"timezone" text DEFAULT 'America/New_York',
	"billing_email" text,
	"owner_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "price_book" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"description" text,
	"category" text,
	"uom" text NOT NULL,
	"unit_price" numeric(12, 4) NOT NULL,
	"waste_factor_default" numeric(5, 2) DEFAULT '0' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"documenso_document_id" integer NOT NULL,
	"documenso_document_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_doc_documenso_id_key" UNIQUE("documenso_document_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid,
	"estimate_id" uuid,
	"customer_id" uuid,
	"service_location_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'lead' NOT NULL,
	"pipeline_value" numeric(12, 2),
	"close_probability" numeric(5, 2),
	"start_date" date,
	"end_date" date,
	"last_contact_date" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_estimates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text DEFAULT 'Untitled Estimate' NOT NULL,
	"calculator_id" text NOT NULL,
	"inputs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"budget_items" jsonb,
	"total_cost" numeric(10, 2) DEFAULT 'NULL',
	"subtotal_cents" bigint,
	"tax_cents" bigint,
	"total_cents" bigint,
	"tax_basis_points" integer,
	"verified_county" text,
	"verification_status" text DEFAULT 'unverified' NOT NULL,
	"client_name" text,
	"job_site_address" text,
	"status" text DEFAULT 'Draft',
	"share_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"business_id" uuid NOT NULL,
	CONSTRAINT "saved_estimates_share_code_key" UNIQUE("share_code"),
	CONSTRAINT "saved_estimates_verification_status_check" CHECK (verification_status = ANY (ARRAY['unverified'::text, 'verified'::text, 'corrected'::text])),
	CONSTRAINT "saved_estimates_status_check" CHECK (status = ANY (ARRAY['Draft'::text, 'Sent'::text, 'Approved'::text, 'Lost'::text, 'PENDING'::text, 'SIGNED'::text])),
	CONSTRAINT "saved_estimates_total_cents_consistency" CHECK (((subtotal_cents IS NULL) AND (tax_cents IS NULL) AND (total_cents IS NULL)) OR (total_cents = (subtotal_cents + tax_cents)))
);
--> statement-breakpoint
CREATE TABLE "service_locations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"street_address" text NOT NULL,
	"city" text,
	"state" text,
	"zip" text,
	"property_type" "property_type",
	"gate_codes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_notes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"author_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "takeoff_measurements" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid,
	"drawing_name" text,
	"measurement_type" text NOT NULL,
	"unit" text NOT NULL,
	"value" numeric(14, 4) NOT NULL,
	"raw_points" jsonb NOT NULL,
	"label" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_tokens" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_materials" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"material_name" text NOT NULL,
	"category" text,
	"unit_type" text,
	"unit_cost" numeric(10, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"business_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp with time zone,
	"image" text,
	"pro_mode_enabled" boolean,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_specs" ADD CONSTRAINT "equipment_specs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_specs" ADD CONSTRAINT "equipment_specs_service_location_id_fkey" FOREIGN KEY ("service_location_id") REFERENCES "public"."service_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_book" ADD CONSTRAINT "price_book_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "public"."saved_estimates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_estimates" ADD CONSTRAINT "saved_estimates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_estimates" ADD CONSTRAINT "saved_estimates_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_notes" ADD CONSTRAINT "site_notes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_notes" ADD CONSTRAINT "site_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_notes" ADD CONSTRAINT "site_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takeoff_measurements" ADD CONSTRAINT "takeoff_measurements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takeoff_measurements" ADD CONSTRAINT "takeoff_measurements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_materials" ADD CONSTRAINT "user_materials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_materials" ADD CONSTRAINT "user_materials_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "business_profiles_business_id_uidx" ON "business_profiles" USING btree ("business_id" uuid_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "businesses_join_code_uidx" ON "businesses" USING btree ("join_code" text_ops) WHERE (join_code IS NOT NULL);--> statement-breakpoint
CREATE INDEX "businesses_owner_id_idx" ON "businesses" USING btree ("owner_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "customers_organization_id_idx" ON "customers" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "equipment_specs_location_id_idx" ON "equipment_specs" USING btree ("service_location_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "leads_org_status_idx" ON "leads" USING btree ("organization_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "memberships_business_id_idx" ON "memberships" USING btree ("business_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "memberships_business_user_role_idx" ON "memberships" USING btree ("business_id" text_ops,"user_id" text_ops,"role" uuid_ops);--> statement-breakpoint
CREATE INDEX "memberships_user_id_idx" ON "memberships" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "organizations_owner_user_id_idx" ON "organizations" USING btree ("owner_user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "price_book_org_sku_idx" ON "price_book" USING btree ("organization_id" text_ops,"sku" text_ops);--> statement-breakpoint
CREATE INDEX "projects_org_status_idx" ON "projects" USING btree ("organization_id" uuid_ops,"status" uuid_ops);--> statement-breakpoint
CREATE INDEX "saved_estimates_business_id_idx" ON "saved_estimates" USING btree ("business_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "saved_estimates_created_at_idx" ON "saved_estimates" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "saved_estimates_share_code_idx" ON "saved_estimates" USING btree ("share_code" text_ops) WHERE (share_code IS NOT NULL);--> statement-breakpoint
CREATE INDEX "saved_estimates_status_idx" ON "saved_estimates" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "saved_estimates_user_id_idx" ON "saved_estimates" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "service_loc_org_id_idx" ON "service_locations" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "site_notes_project_id_idx" ON "site_notes" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "takeoff_measurements_project_idx" ON "takeoff_measurements" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "two_factor_tokens_email_idx" ON "two_factor_tokens" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "two_factor_tokens_expires_idx" ON "two_factor_tokens" USING btree ("expires" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "user_materials_business_id_idx" ON "user_materials" USING btree ("business_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "user_materials_user_id_idx" ON "user_materials" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Anyone can sign up" ON "email_signups" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);