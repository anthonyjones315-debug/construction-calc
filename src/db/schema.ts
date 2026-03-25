import { pgTable, index, foreignKey, unique, uuid, text, timestamp, numeric, boolean, jsonb, pgPolicy, date, uniqueIndex, integer, check, bigint, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const SAVED_ESTIMATE_CHECK_CONSTRAINT = "(total_cents = subtotal_cents + tax_cents)";
export const SAVED_ESTIMATE_RLS_POLICY = 'create policy "Users can only see their own estimates" on public.saved_estimates for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)';
export type IntegerCurrency = number;
export type IntegerDimension = number;

export type SavedEstimateIntegrityRow = {
  id: string;
  subtotal_cents: IntegerCurrency | null;
  tax_cents: IntegerCurrency | null;
  total_cents: IntegerCurrency | null;
  tax_basis_points: number | null;
  verified_county: string | null;
  verification_status: "unverified" | "verified" | "corrected";
};

export type StructuredCalculationRow = SavedEstimateIntegrityRow & {
  width_milli_inches: IntegerDimension | null;
  length_milli_inches: IntegerDimension | null;
  depth_milli_inches: IntegerDimension | null;
};

// ==========================================
// DRIZZLE INTROSPECTED & EXPANDED SCHEMA
// ==========================================

export const projectStatus = pgEnum("project_status", ['lead', 'quoted', 'won', 'lost', 'completed', 'scheduled', 'in_progress'])
export const leadSourceEnum = pgEnum("lead_source", ['website', 'referral', 'google', 'facebook', 'other'])
export const propertyTypeEnum = pgEnum("property_type", ['residential', 'commercial', 'industrial'])
export const eventTypeEnum = pgEnum("event_type", ['email_sent', 'estimate_viewed', 'estimate_signed', 'phone_call', 'note_added', 'meeting_scheduled', 'invoice_sent', 'invoice_paid'])
export const invoiceStatusEnum = pgEnum("invoice_status", ['draft', 'sent', 'viewed', 'partially_paid', 'paid', 'overdue', 'cancelled'])
export const eventCategoryEnum = pgEnum("event_category", ['quote', 'service', 'install', 'maintenance', 'internal'])
export const userRoleEnum = pgEnum("user_role", ['owner', 'admin', 'tech', 'sales'])

export const organizations = pgTable("organizations", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug"),
	planTier: text("plan_tier").default('free').notNull(),
	timezone: text("timezone").default('America/New_York'),
	billingEmail: text("billing_email"),
	ownerUserId: uuid("owner_user_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("organizations_owner_user_id_idx").using("btree", table.ownerUserId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [users.id],
			name: "organizations_owner_user_id_fkey"
		}).onDelete("set null"),
	unique("organizations_slug_key").on(table.slug),
]);

export const priceBook = pgTable("price_book", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	sku: text("sku").notNull(),
	description: text("description"),
	category: text("category"),
	uom: text("uom").notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  4 }).notNull(),
	wasteFactorDefault: numeric("waste_factor_default", { precision: 5, scale:  2 }).default('0').notNull(),
	active: boolean("active").default(true).notNull(),
	lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: 'string' }),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("price_book_org_sku_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.sku.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "price_book_organization_id_fkey"
		}).onDelete("cascade"),
]);

export const leads = pgTable("leads", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	createdByUserId: uuid("created_by_user_id"),
	clientName: text("client_name").notNull(),
	clientEmail: text("client_email"),
	clientPhone: text("client_phone"),
	projectAddress: text("project_address"),
	source: text("source"),
	interestScore: numeric("interest_score", { precision: 5, scale:  2 }),
	notes: text("notes"),
	status: text("status").default('lead').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("leads_org_status_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "leads_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdByUserId],
			foreignColumns: [users.id],
			name: "leads_created_by_user_id_fkey"
		}).onDelete("set null"),
]);

export const clients = pgTable("clients", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	businessId: text("business_id"),
	name: text("name").notNull(),
	email: text("email"),
	phone: text("phone"),
	address: text("address"),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("clients_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("clients_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const twoFactorTokens = pgTable("two_factor_tokens", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: text("email").notNull(),
	token: text("token").notNull(),
	expires: timestamp("expires", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("two_factor_tokens_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("two_factor_tokens_expires_idx").using("btree", table.expires.asc().nullsLast().op("timestamptz_ops")),
]);

export const users = pgTable("users", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text("name"),
	email: text("email"),
	emailVerified: timestamp("emailVerified", { withTimezone: true, mode: 'string' }),
	image: text("image"),
	proModeEnabled: boolean("pro_mode_enabled"),
	twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    role: userRoleEnum("role").default('tech').notNull(),
    isActiveLicense: boolean("is_active_license").default(true).notNull(),
    calendarPreferences: jsonb("calendar_preferences").default({}),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const emailSignups = pgTable("email_signups", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: text("email").notNull(),
	source: text("source").default('splash'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	marketingConsent: boolean("marketing_consent").default(false).notNull(),
	consentText: text("consent_text"),
	consentVersion: text("consent_version"),
	consentRecordedAt: timestamp("consent_recorded_at", { withTimezone: true, mode: 'string' }),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	unique("email_signups_email_key").on(table.email),
	pgPolicy("Anyone can sign up", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
]);

export const projects = pgTable("projects", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	leadId: uuid("lead_id"),
	estimateId: uuid("estimate_id"),
	customerId: uuid("customer_id"),
	serviceLocationId: uuid("service_location_id"),
	name: text("name").notNull(),
	description: text("description"),
	status: projectStatus("status").default('lead').notNull(),
	pipelineValue: numeric("pipeline_value", { precision: 12, scale:  2 }),
	closeProbability: numeric("close_probability", { precision: 5, scale:  2 }),
	startDate: date("start_date"),
	endDate: date("end_date"),
	lastContactDate: timestamp("last_contact_date", { withTimezone: true, mode: 'string' }),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("projects_org_status_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops"), table.status.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "projects_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.leadId],
			foreignColumns: [leads.id],
			name: "projects_lead_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.estimateId],
			foreignColumns: [savedEstimates.id],
			name: "projects_estimate_id_fkey"
		}).onDelete("set null"),
]);

export const takeoffMeasurements = pgTable("takeoff_measurements", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	projectId: uuid("project_id"),
	drawingName: text("drawing_name"),
	measurementType: text("measurement_type").notNull(),
	unit: text("unit").notNull(),
	value: numeric("value", { precision: 14, scale:  4 }).notNull(),
	rawPoints: jsonb("raw_points").notNull(),
	label: text("label"),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("takeoff_measurements_project_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "takeoff_measurements_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "takeoff_measurements_project_id_fkey"
		}).onDelete("cascade"),
]);

export const businesses = pgTable("businesses", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text("name").notNull(),
	ownerId: uuid("owner_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	joinCode: text("join_code"),
	seatLimit: integer("seat_limit").default(10).notNull(),
}, (table) => [
	uniqueIndex("businesses_join_code_uidx").using("btree", table.joinCode.asc().nullsLast().op("text_ops")).where(sql`(join_code IS NOT NULL)`),
	index("businesses_owner_id_idx").using("btree", table.ownerId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "businesses_owner_id_fkey"
		}).onDelete("cascade"),
]);

export const memberships = pgTable("memberships", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: text("role").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("memberships_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("memberships_business_user_role_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops"), table.role.asc().nullsLast().op("uuid_ops")),
	index("memberships_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "memberships_business_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "memberships_user_id_fkey"
		}).onDelete("cascade"),
	unique("memberships_business_id_user_id_key").on(table.businessId, table.userId),
	check("memberships_role_check", sql`role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'member'::text])`),
]);

export const savedEstimates = pgTable("saved_estimates", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text("name").default('Untitled Estimate').notNull(),
	calculatorId: text("calculator_id").notNull(),
	inputs: jsonb("inputs").default({}).notNull(),
	results: jsonb("results").default([]).notNull(),
	budgetItems: jsonb("budget_items"),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }).default('NULL'),
	subtotalCents: bigint("subtotal_cents", { mode: "number" }),
	taxCents: bigint("tax_cents", { mode: "number" }),
	totalCents: bigint("total_cents", { mode: "number" }),
	taxBasisPoints: integer("tax_basis_points"),
	verifiedCounty: text("verified_county"),
	verificationStatus: text("verification_status").default('unverified').notNull(),
	clientName: text("client_name"),
	jobSiteAddress: text("job_site_address"),
	status: text("status").default('Draft'),
	shareCode: text("share_code"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	businessId: uuid("business_id").notNull(),
}, (table) => [
	index("saved_estimates_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("saved_estimates_created_at_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("saved_estimates_share_code_idx").using("btree", table.shareCode.asc().nullsLast().op("text_ops")).where(sql`(share_code IS NOT NULL)`),
	index("saved_estimates_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("saved_estimates_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_estimates_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "saved_estimates_business_id_fkey"
		}).onDelete("cascade"),
	unique("saved_estimates_share_code_key").on(table.shareCode),
	check("saved_estimates_verification_status_check", sql`verification_status = ANY (ARRAY['unverified'::text, 'verified'::text, 'corrected'::text])`),
	check("saved_estimates_status_check", sql`status = ANY (ARRAY['Draft'::text, 'Sent'::text, 'Approved'::text, 'Lost'::text, 'PENDING'::text, 'SIGNED'::text])`),
	check("saved_estimates_total_cents_consistency", sql`((subtotal_cents IS NULL) AND (tax_cents IS NULL) AND (total_cents IS NULL)) OR (total_cents = (subtotal_cents + tax_cents))`),
]);

export const userMaterials = pgTable("user_materials", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	materialName: text("material_name").notNull(),
	category: text("category"),
	unitType: text("unit_type"),
	unitCost: numeric("unit_cost", { precision: 10, scale:  4 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	businessId: uuid("business_id").notNull(),
}, (table) => [
	index("user_materials_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	index("user_materials_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_materials_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "user_materials_business_id_fkey"
		}).onDelete("cascade"),
]);

export const businessProfiles = pgTable("business_profiles", {
	userId: uuid("user_id").primaryKey().notNull(),
	businessName: text("business_name"),
	businessPhone: text("business_phone"),
	businessEmail: text("business_email"),
	businessAddress: text("business_address"),
	businessWebsite: text("business_website"),
	logoUrl: text("logo_url"),

	legalBusinessName: text("legal_business_name"),
    taxIdEin: text("tax_id_ein"),
    stateLicenseNumber: text("state_license_number"),
    insuranceProvider: text("insurance_provider"),
    supportEmail: text("support_email"),
    supportPhone: text("support_phone"),
    billingAddress: text("billing_address"),
    timezone: text("timezone"),

	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	businessId: uuid("business_id").notNull(),
	organizationId: uuid("organization_id"),
}, (table) => [
	uniqueIndex("business_profiles_business_id_uidx").using("btree", table.businessId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "business_profiles_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "business_profiles_user_id_fkey"
		}),
	foreignKey({
			columns: [table.businessId],
			foreignColumns: [businesses.id],
			name: "business_profiles_business_id_fkey"
		}).onDelete("cascade"),
]);

// ==========================================
// NEW CRM DATA MODELS
// ==========================================

export const customers = pgTable("customers", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(), 
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	primaryEmail: text("primary_email"),
	primaryPhone: text("primary_phone"),
	leadSource: leadSourceEnum("lead_source"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("customers_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "customers_organization_id_fkey"
		}).onDelete("cascade"),
]);

export const serviceLocations = pgTable("service_locations", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(), 
	customerId: uuid("customer_id").notNull(),
	streetAddress: text("street_address").notNull(),
	city: text("city"),
	state: text("state"),
	zip: text("zip"),
	propertyType: propertyTypeEnum("property_type"),
	gateCodes: text("gate_codes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("service_loc_org_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "service_locations_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "service_locations_customer_id_fkey"
		}).onDelete("cascade"),
]);

export const siteNotes = pgTable("site_notes", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(), 
	projectId: uuid("project_id").notNull(),
	authorId: uuid("author_id"),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("site_notes_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "site_notes_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "site_notes_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "site_notes_author_id_fkey"
		}).onDelete("set null"),
]);

export const equipmentSpecs = pgTable("equipment_specs", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(), 
	serviceLocationId: uuid("service_location_id").notNull(),
	systemType: text("system_type").notNull(),
	manufacturer: text("manufacturer"),
	modelNumber: text("model_number"),
	serialNumber: text("serial_number"),
	installDate: date("install_date"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("equipment_specs_location_id_idx").using("btree", table.serviceLocationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "equipment_specs_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceLocationId],
			foreignColumns: [serviceLocations.id],
			name: "equipment_specs_service_location_id_fkey"
		}).onDelete("cascade"),
]);

export const projectDocuments = pgTable("project_documents", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	projectId: uuid("project_id").notNull(),
	documensoDocumentId: integer("documenso_document_id").notNull(),
    documensoDocumentUrl: text("documenso_document_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("project_doc_documenso_id_key").on(table.documensoDocumentId),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "project_documents_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_documents_project_id_fkey"
		}).onDelete("cascade"),
]);

export const customerActivityLogs = pgTable("customer_activity_logs", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(), // tenant_id
	customerId: uuid("customer_id").notNull(),
	userId: uuid("user_id"),
	eventType: eventTypeEnum("event_type").notNull(),
	description: text("description").notNull(),
	metadata: jsonb("metadata").default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("customer_activity_logs_org_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("customer_activity_logs_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "customer_activity_logs_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "customer_activity_logs_customer_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "customer_activity_logs_user_id_fkey"
		}).onDelete("set null"),
]);

export const invoices = pgTable("invoices", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	projectId: uuid("project_id").notNull(),
	customerId: uuid("customer_id").notNull(),
    invoiceNumber: text("invoice_number").notNull(),
	status: invoiceStatusEnum("status").default('draft').notNull(),
	dueDate: date("due_date"),
	totalAmount: numeric("total_amount", { precision: 12, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("invoices_organization_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("invoices_project_id_idx").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "invoices_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "invoices_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "invoices_customer_id_fkey"
		}).onDelete("cascade"),
]);

export const invoiceLineItems = pgTable("invoice_line_items", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	serviceItem: text("service_item").notNull(),
	quantity: numeric("quantity", { precision: 10, scale:  4 }).default('1').notNull(),
	unitCost: numeric("unit_cost", { precision: 12, scale:  2 }).default('0').notNull(),
	total: numeric("total", { precision: 12, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("invoice_line_items_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "invoice_line_items_invoice_id_fkey"
		}).onDelete("cascade"),
]);

export const scheduleEvents = pgTable("schedule_events", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(), // tenant_id
	projectId: uuid("project_id"),
	assignedUserId: uuid("assigned_user_id"),
	title: text("title").notNull(),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }).notNull(),
	eventCategory: eventCategoryEnum("event_category").default('service').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("schedule_events_org_id_idx").using("btree", table.organizationId.asc().nullsLast().op("uuid_ops")),
	index("schedule_events_user_id_idx").using("btree", table.assignedUserId.asc().nullsLast().op("uuid_ops")),
	index("schedule_events_dates_idx").using("btree", table.startTime.asc().nullsLast().op("timestamptz_ops"), table.endTime.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizations.id],
			name: "schedule_events_organization_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "schedule_events_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedUserId],
			foreignColumns: [users.id],
			name: "schedule_events_assigned_user_id_fkey"
		}).onDelete("set null"),
]);
