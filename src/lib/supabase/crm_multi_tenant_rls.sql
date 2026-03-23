-- ============================================================
-- Pro Construction Calc: CRM Multi-Tenant Security Migration
-- Run this in your Supabase SQL Editor.
-- This ensures that contractors in the same business can see
-- each other's contacts/invoices, but NO ONE else can.
-- ============================================================

-- Ensure the tables exist
CREATE TABLE IF NOT EXISTS crm_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  notes text,
  status text DEFAULT 'Lead',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES crm_contacts(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'Draft',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES crm_contacts(id) ON DELETE CASCADE,
  scheduled_date timestamptz NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- Enable RLS
-- ─────────────────────────────────────────────────────────────
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts FORCE ROW LEVEL SECURITY;

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules FORCE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- Apply Multi-Tenant Isolation Policies
-- (Depends on is_business_member() from business-multi-tenant-migration.sql)
-- ─────────────────────────────────────────────────────────────

-- crm_contacts policies
DROP POLICY IF EXISTS "crm_contacts_select_member" ON crm_contacts;
CREATE POLICY "crm_contacts_select_member" ON crm_contacts
  FOR SELECT USING (is_business_member(business_id));

DROP POLICY IF EXISTS "crm_contacts_insert_member" ON crm_contacts;
CREATE POLICY "crm_contacts_insert_member" ON crm_contacts
  FOR INSERT WITH CHECK (is_business_member(business_id));

DROP POLICY IF EXISTS "crm_contacts_update_member" ON crm_contacts;
CREATE POLICY "crm_contacts_update_member" ON crm_contacts
  FOR UPDATE USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

DROP POLICY IF EXISTS "crm_contacts_delete_member" ON crm_contacts;
CREATE POLICY "crm_contacts_delete_member" ON crm_contacts
  FOR DELETE USING (has_business_role(business_id, array['owner', 'admin']));

-- invoices policies
DROP POLICY IF EXISTS "invoices_select_member" ON invoices;
CREATE POLICY "invoices_select_member" ON invoices
  FOR SELECT USING (is_business_member(business_id));

DROP POLICY IF EXISTS "invoices_insert_member" ON invoices;
CREATE POLICY "invoices_insert_member" ON invoices
  FOR INSERT WITH CHECK (is_business_member(business_id));

DROP POLICY IF EXISTS "invoices_update_member" ON invoices;
CREATE POLICY "invoices_update_member" ON invoices
  FOR UPDATE USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

DROP POLICY IF EXISTS "invoices_delete_member" ON invoices;
CREATE POLICY "invoices_delete_member" ON invoices
  FOR DELETE USING (has_business_role(business_id, array['owner', 'admin']));

-- schedules policies
DROP POLICY IF EXISTS "schedules_select_member" ON schedules;
CREATE POLICY "schedules_select_member" ON schedules
  FOR SELECT USING (is_business_member(business_id));

DROP POLICY IF EXISTS "schedules_insert_member" ON schedules;
CREATE POLICY "schedules_insert_member" ON schedules
  FOR INSERT WITH CHECK (is_business_member(business_id));

DROP POLICY IF EXISTS "schedules_update_member" ON schedules;
CREATE POLICY "schedules_update_member" ON schedules
  FOR UPDATE USING (is_business_member(business_id)) WITH CHECK (is_business_member(business_id));

DROP POLICY IF EXISTS "schedules_delete_member" ON schedules;
CREATE POLICY "schedules_delete_member" ON schedules
  FOR DELETE USING (has_business_role(business_id, array['owner', 'admin']));
