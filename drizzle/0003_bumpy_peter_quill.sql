CREATE TYPE "public"."lead_source" AS ENUM('website', 'referral', 'google', 'facebook', 'other');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('residential', 'commercial', 'industrial');--> statement-breakpoint
ALTER TYPE "public"."project_status" ADD VALUE 'scheduled';--> statement-breakpoint
ALTER TYPE "public"."project_status" ADD VALUE 'in_progress';--> statement-breakpoint
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

ALTER TABLE "business_profiles" ADD COLUMN "legal_business_name" text;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN "tax_id_ein" text;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN "state_license_number" text;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN "insurance_provider" text;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN "support_email" text;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN "support_phone" text;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN "billing_address" text;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "service_location_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_specs" ADD CONSTRAINT "equipment_specs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_specs" ADD CONSTRAINT "equipment_specs_service_location_id_fkey" FOREIGN KEY ("service_location_id") REFERENCES "public"."service_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_locations" ADD CONSTRAINT "service_locations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_notes" ADD CONSTRAINT "site_notes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_notes" ADD CONSTRAINT "site_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_notes" ADD CONSTRAINT "site_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_organization_id_idx" ON "customers" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "equipment_specs_location_id_idx" ON "equipment_specs" USING btree ("service_location_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "service_loc_org_id_idx" ON "service_locations" USING btree ("organization_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "site_notes_project_id_idx" ON "site_notes" USING btree ("project_id" uuid_ops);--> statement-breakpoint