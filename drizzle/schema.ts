import { pgTable, index, foreignKey, unique, uuid, text, timestamp, numeric, boolean, jsonb, pgPolicy, date, uniqueIndex, integer, check, bigint, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const projectStatus = pgEnum("project_status", ['lead', 'quoted', 'won', 'lost', 'completed'])


export const organizations = pgTable("organizations", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	slug: text(),
	planTier: text("plan_tier").default('free').notNull(),
	timezone: text().default('America/New_York'),
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
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	sku: text().notNull(),
	description: text(),
	category: text(),
	uom: text().notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  4 }).notNull(),
	wasteFactorDefault: numeric("waste_factor_default", { precision: 5, scale:  2 }).default('0').notNull(),
	active: boolean().default(true).notNull(),
	lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: 'string' }),
	metadata: jsonb().default({}),
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
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	createdByUserId: uuid("created_by_user_id"),
	clientName: text("client_name").notNull(),
	clientEmail: text("client_email"),
	clientPhone: text("client_phone"),
	projectAddress: text("project_address"),
	source: text(),
	interestScore: numeric("interest_score", { precision: 5, scale:  2 }),
	notes: text(),
	status: text().default('lead').notNull(),
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
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	businessId: text("business_id"),
	name: text().notNull(),
	email: text(),
	phone: text(),
	address: text(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("clients_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("clients_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const twoFactorTokens = pgTable("two_factor_tokens", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("two_factor_tokens_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("two_factor_tokens_expires_idx").using("btree", table.expires.asc().nullsLast().op("timestamptz_ops")),
]);

export const users = pgTable("users", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp({ withTimezone: true, mode: 'string' }),
	image: text(),
	proModeEnabled: boolean("pro_mode_enabled"),
	twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const emailSignups = pgTable("email_signups", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: text().notNull(),
	source: text().default('splash'),
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
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	leadId: uuid("lead_id"),
	estimateId: uuid("estimate_id"),
	name: text().notNull(),
	status: projectStatus().default('lead').notNull(),
	pipelineValue: numeric("pipeline_value", { precision: 12, scale:  2 }),
	closeProbability: numeric("close_probability", { precision: 5, scale:  2 }),
	startDate: date("start_date"),
	endDate: date("end_date"),
	lastContactDate: timestamp("last_contact_date", { withTimezone: true, mode: 'string' }),
	metadata: jsonb().default({}),
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
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	organizationId: uuid("organization_id").notNull(),
	projectId: uuid("project_id"),
	drawingName: text("drawing_name"),
	measurementType: text("measurement_type").notNull(),
	unit: text().notNull(),
	value: numeric({ precision: 14, scale:  4 }).notNull(),
	rawPoints: jsonb("raw_points").notNull(),
	label: text(),
	metadata: jsonb().default({}),
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
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
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
	pgPolicy("businesses_select_member", { as: "permissive", for: "select", to: ["public"], using: sql`is_business_member(id)` }),
	pgPolicy("businesses_insert_owner_only", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("businesses_update_owner_only", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("businesses_delete_owner_only", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const memberships = pgTable("memberships", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	businessId: uuid("business_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: text().notNull(),
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
	pgPolicy("memberships_select_member", { as: "permissive", for: "select", to: ["public"], using: sql`is_business_member(business_id)` }),
	pgPolicy("memberships_insert_owner_only", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("memberships_update_owner_only", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("memberships_delete_owner_only", { as: "permissive", for: "delete", to: ["public"] }),
	check("memberships_role_check", sql`role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'member'::text])`),
]);

export const savedEstimates = pgTable("saved_estimates", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().default('Untitled Estimate').notNull(),
	calculatorId: text("calculator_id").notNull(),
	inputs: jsonb().default({}).notNull(),
	results: jsonb().default([]).notNull(),
	budgetItems: jsonb("budget_items"),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }).default('NULL'),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	subtotalCents: bigint("subtotal_cents", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taxCents: bigint("tax_cents", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalCents: bigint("total_cents", { mode: "number" }),
	taxBasisPoints: integer("tax_basis_points"),
	verifiedCounty: text("verified_county"),
	verificationStatus: text("verification_status").default('unverified').notNull(),
	clientName: text("client_name"),
	jobSiteAddress: text("job_site_address"),
	status: text().default('Draft'),
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
	pgPolicy("saved_estimates_select_member", { as: "permissive", for: "select", to: ["public"], using: sql`is_business_member(business_id)` }),
	pgPolicy("saved_estimates_insert_member", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("saved_estimates_update_owner_or_creator", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("saved_estimates_delete_owner_or_creator", { as: "permissive", for: "delete", to: ["public"] }),
	check("saved_estimates_verification_status_check", sql`verification_status = ANY (ARRAY['unverified'::text, 'verified'::text, 'corrected'::text])`),
	check("saved_estimates_status_check", sql`status = ANY (ARRAY['Draft'::text, 'Sent'::text, 'Approved'::text, 'Lost'::text, 'PENDING'::text, 'SIGNED'::text])`),
	check("saved_estimates_total_cents_consistency", sql`((subtotal_cents IS NULL) AND (tax_cents IS NULL) AND (total_cents IS NULL)) OR (total_cents = (subtotal_cents + tax_cents))`),
]);

export const userMaterials = pgTable("user_materials", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	materialName: text("material_name").notNull(),
	category: text(),
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
	pgPolicy("user_materials_select_member", { as: "permissive", for: "select", to: ["public"], using: sql`is_business_member(business_id)` }),
	pgPolicy("user_materials_insert_member", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("user_materials_update_owner_only", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("user_materials_delete_owner_only", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const businessProfiles = pgTable("business_profiles", {
	userId: uuid("user_id").primaryKey().notNull(),
	businessName: text("business_name"),
	businessPhone: text("business_phone"),
	businessEmail: text("business_email"),
	businessAddress: text("business_address"),
	businessWebsite: text("business_website"),
	logoUrl: text("logo_url"),
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
	pgPolicy("business_profiles_select_member", { as: "permissive", for: "select", to: ["public"], using: sql`is_business_member(business_id)` }),
	pgPolicy("business_profiles_insert_owner_only", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("business_profiles_update_owner_only", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("business_profiles_delete_owner_only", { as: "permissive", for: "delete", to: ["public"] }),
]);
