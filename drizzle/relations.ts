import { relations } from "drizzle-orm/relations";
import { users, organizations, priceBook, leads, projects, savedEstimates, takeoffMeasurements, businesses, memberships, userMaterials, businessProfiles } from "./schema";

export const organizationsRelations = relations(organizations, ({one, many}) => ({
	user: one(users, {
		fields: [organizations.ownerUserId],
		references: [users.id]
	}),
	priceBooks: many(priceBook),
	leads: many(leads),
	projects: many(projects),
	takeoffMeasurements: many(takeoffMeasurements),
	businessProfiles: many(businessProfiles),
}));

export const usersRelations = relations(users, ({many}) => ({
	organizations: many(organizations),
	leads: many(leads),
	businesses: many(businesses),
	memberships: many(memberships),
	savedEstimates: many(savedEstimates),
	userMaterials: many(userMaterials),
	businessProfiles: many(businessProfiles),
}));

export const priceBookRelations = relations(priceBook, ({one}) => ({
	organization: one(organizations, {
		fields: [priceBook.organizationId],
		references: [organizations.id]
	}),
}));

export const leadsRelations = relations(leads, ({one, many}) => ({
	organization: one(organizations, {
		fields: [leads.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [leads.createdByUserId],
		references: [users.id]
	}),
	projects: many(projects),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	organization: one(organizations, {
		fields: [projects.organizationId],
		references: [organizations.id]
	}),
	lead: one(leads, {
		fields: [projects.leadId],
		references: [leads.id]
	}),
	savedEstimate: one(savedEstimates, {
		fields: [projects.estimateId],
		references: [savedEstimates.id]
	}),
	takeoffMeasurements: many(takeoffMeasurements),
}));

export const savedEstimatesRelations = relations(savedEstimates, ({one, many}) => ({
	projects: many(projects),
	user: one(users, {
		fields: [savedEstimates.userId],
		references: [users.id]
	}),
	business: one(businesses, {
		fields: [savedEstimates.businessId],
		references: [businesses.id]
	}),
}));

export const takeoffMeasurementsRelations = relations(takeoffMeasurements, ({one}) => ({
	organization: one(organizations, {
		fields: [takeoffMeasurements.organizationId],
		references: [organizations.id]
	}),
	project: one(projects, {
		fields: [takeoffMeasurements.projectId],
		references: [projects.id]
	}),
}));

export const businessesRelations = relations(businesses, ({one, many}) => ({
	user: one(users, {
		fields: [businesses.ownerId],
		references: [users.id]
	}),
	memberships: many(memberships),
	savedEstimates: many(savedEstimates),
	userMaterials: many(userMaterials),
	businessProfiles: many(businessProfiles),
}));

export const membershipsRelations = relations(memberships, ({one}) => ({
	business: one(businesses, {
		fields: [memberships.businessId],
		references: [businesses.id]
	}),
	user: one(users, {
		fields: [memberships.userId],
		references: [users.id]
	}),
}));

export const userMaterialsRelations = relations(userMaterials, ({one}) => ({
	user: one(users, {
		fields: [userMaterials.userId],
		references: [users.id]
	}),
	business: one(businesses, {
		fields: [userMaterials.businessId],
		references: [businesses.id]
	}),
}));

export const businessProfilesRelations = relations(businessProfiles, ({one}) => ({
	organization: one(organizations, {
		fields: [businessProfiles.organizationId],
		references: [organizations.id]
	}),
	user: one(users, {
		fields: [businessProfiles.userId],
		references: [users.id]
	}),
	business: one(businesses, {
		fields: [businessProfiles.businessId],
		references: [businesses.id]
	}),
}));