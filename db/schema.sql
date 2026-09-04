CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY,
  invoice_type VARCHAR(30) NOT NULL CHECK (invoice_type IN ('catering','housekeeping')),
  invoice_no VARCHAR(100) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  period_from DATE,
  period_to DATE,
  work_description TEXT,
  bill_to_name TEXT NOT NULL,
  bill_to_address TEXT,
  bill_to_gstin VARCHAR(30),
  bill_to_state VARCHAR(100),
  bill_description TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  tax_cgst NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_sgst NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoices_type_idx ON invoices(invoice_type);
CREATE INDEX IF NOT EXISTS invoices_date_idx ON invoices(invoice_date DESC);
