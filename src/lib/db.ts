import { neon } from '@neondatabase/serverless'
import { PaymentRecord } from '@/types'

// ---------------------------------------------------------------------------
// Neon serverless SQL client – uses HTTP transport, works on Vercel edge/serverless
// ---------------------------------------------------------------------------
const sql = neon(process.env.DATABASE_URL!)

// ---------------------------------------------------------------------------
// Auto-initialize the payments table (PostgreSQL syntax)
// ---------------------------------------------------------------------------
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id                  SERIAL PRIMARY KEY,
      reference           VARCHAR(50)  NOT NULL UNIQUE,
      name                VARCHAR(100) NOT NULL,
      email               VARCHAR(100) NOT NULL,
      phone               VARCHAR(20)  NOT NULL,
      county              VARCHAR(50)  NOT NULL,
      study_level         VARCHAR(50)  NOT NULL,
      referral            VARCHAR(50)  NOT NULL,
      course              VARCHAR(100) NOT NULL,
      amount              INT          NOT NULL DEFAULT 8000,
      status              VARCHAR(20)  NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','success','failed')),
      mpesa_receipt       VARCHAR(50)  NULL,
      checkout_request_id VARCHAR(100) NULL,
      created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      paid_at             TIMESTAMPTZ  NULL
    )
  `

  // Ensure indexes exist (idempotent)
  await sql`CREATE INDEX IF NOT EXISTS idx_reference ON payments (reference)`
  await sql`CREATE INDEX IF NOT EXISTS idx_status    ON payments (status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_email     ON payments (email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_checkout  ON payments (checkout_request_id)`

  await initSiteSettings()

  console.log('Neon PostgreSQL database initialized successfully')
}

export async function initSiteSettings() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id            SERIAL PRIMARY KEY,
      setting_key   VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT         NOT NULL,
      updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings (setting_key)`
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const rows = await sql`SELECT setting_key, setting_value FROM site_settings`
  return Object.fromEntries((rows as Array<{ setting_key: string; setting_value: string }>).map((row) => [row.setting_key, row.setting_value]))
}

export async function getSiteSetting(key: string, fallback?: string): Promise<string> {
  const rows = await sql`SELECT setting_value FROM site_settings WHERE setting_key = ${key} LIMIT 1`
  const value = (rows[0] as { setting_value?: string } | undefined)?.setting_value
  return value ?? fallback ?? ''
}

export async function getSiteSettingNumber(key: string, fallback: number): Promise<number> {
  const value = await getSiteSetting(key)
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function getSiteSettingBoolean(key: string, fallback: boolean): Promise<boolean> {
  const value = await getSiteSetting(key)
  if (!value) return fallback
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
}

export async function setSiteSetting(key: string, value: string) {
  await sql`
    INSERT INTO site_settings (setting_key, setting_value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value,
        updated_at = NOW()
  `
}

// ---------------------------------------------------------------------------
// Insert a new payment record (status = pending)
// ---------------------------------------------------------------------------
export async function insertPayment(record: PaymentRecord) {
  await sql`
    INSERT INTO payments
      (reference, name, email, phone, county, study_level, referral,
       course, amount, status, checkout_request_id)
    VALUES
      (${record.reference}, ${record.name}, ${record.email}, ${record.phone},
       ${record.county}, ${record.study_level}, ${record.referral},
       ${record.course}, ${record.amount}, 'pending',
       ${record.checkout_request_id ?? null})
    ON CONFLICT (reference) DO NOTHING
  `
}

// ---------------------------------------------------------------------------
// Update payment status by reference
// ---------------------------------------------------------------------------
export async function updatePaymentStatus(
  reference: string,
  status: 'success' | 'failed',
  mpesaReceipt?: string
) {
  await sql`
    UPDATE payments
    SET
      status        = ${status},
      mpesa_receipt = ${mpesaReceipt ?? null},
      paid_at       = ${status === 'success' ? new Date().toISOString() : null}
    WHERE reference = ${reference}
  `
}

// ---------------------------------------------------------------------------
// Update payment status by Safaricom CheckoutRequestID (used in callback)
// ---------------------------------------------------------------------------
export async function updatePaymentStatusByCheckoutRequestId(
  checkoutRequestId: string,
  status: 'success' | 'failed',
  mpesaReceipt?: string
) {
  await sql`
    UPDATE payments
    SET
      status        = ${status},
      mpesa_receipt = ${mpesaReceipt ?? null},
      paid_at       = ${status === 'success' ? new Date().toISOString() : null}
    WHERE checkout_request_id = ${checkoutRequestId}
  `
}

// ---------------------------------------------------------------------------
// Fetch a single payment by reference
// ---------------------------------------------------------------------------
export async function getPaymentByReference(reference: string): Promise<PaymentRecord | null> {
  const rows = await sql`
    SELECT * FROM payments WHERE reference = ${reference} LIMIT 1
  `
  return (rows[0] as PaymentRecord) ?? null
}

// ---------------------------------------------------------------------------
// Fetch a single payment by CheckoutRequestID
// ---------------------------------------------------------------------------
export async function getPaymentByCheckoutRequestId(checkoutRequestId: string): Promise<PaymentRecord | null> {
  const rows = await sql`
    SELECT * FROM payments WHERE checkout_request_id = ${checkoutRequestId} LIMIT 1
  `
  return (rows[0] as PaymentRecord) ?? null
}

// ---------------------------------------------------------------------------
// Fetch all payments ordered by newest first (admin dashboard)
// ---------------------------------------------------------------------------
export async function getAllPayments(): Promise<PaymentRecord[]> {
  const rows = await sql`
    SELECT * FROM payments ORDER BY created_at DESC
  `
  return rows as PaymentRecord[]
}

// ---------------------------------------------------------------------------
// Aggregate stats for the admin dashboard header cards
// ---------------------------------------------------------------------------
export async function getPaymentStats() {
  const rows = await sql`
    SELECT
      COUNT(*)                                                  AS total,
      COUNT(*) FILTER (WHERE status = 'success')               AS paid,
      COUNT(*) FILTER (WHERE status = 'pending')               AS pending,
      COUNT(*) FILTER (WHERE status = 'failed')                AS failed,
      COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0) AS revenue
    FROM payments
  `
  const r = rows[0] ?? {}
  return {
    total:   Number(r.total   ?? 0),
    paid:    Number(r.paid    ?? 0),
    pending: Number(r.pending ?? 0),
    failed:  Number(r.failed  ?? 0),
    revenue: Number(r.revenue ?? 0),
  }
}

// ---------------------------------------------------------------------------
// Admin users table – auto-init
// ---------------------------------------------------------------------------
export async function initAdminUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id         SERIAL PRIMARY KEY,
      username   VARCHAR(50)  NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      role       VARCHAR(20)  NOT NULL DEFAULT 'viewer'
                   CHECK (role IN ('superadmin', 'admin', 'viewer')),
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      last_login TIMESTAMPTZ  NULL
    )
  `
}

export async function getAllAdminUsers() {
  const rows = await sql`
    SELECT id, username, role, created_at, last_login
    FROM admin_users
    ORDER BY created_at DESC
  `
  return rows
}

export async function createAdminUser(username: string, password: string, role: string) {
  await sql`
    INSERT INTO admin_users (username, password, role)
    VALUES (${username}, ${password}, ${role})
    ON CONFLICT (username) DO NOTHING
  `
}

export async function updateAdminUserRole(id: number, role: string) {
  await sql`UPDATE admin_users SET role = ${role} WHERE id = ${id}`
}

export async function deleteAdminUser(id: number) {
  await sql`DELETE FROM admin_users WHERE id = ${id}`
}

// ---------------------------------------------------------------------------
// Analytics queries
// ---------------------------------------------------------------------------
export async function getEnrollmentsByDay(days = 30) {
  const rows = await sql`
    SELECT
      DATE(created_at) AS day,
      COUNT(*)         AS total,
      COUNT(*) FILTER (WHERE status = 'success') AS confirmed,
      COALESCE(SUM(amount) FILTER (WHERE status = 'success'), 0) AS revenue
    FROM payments
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day ASC
  `
  return rows
}

export async function getEnrollmentsByCourse() {
  const rows = await sql`
    SELECT course,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'success') AS confirmed
    FROM payments
    GROUP BY course
    ORDER BY total DESC
  `
  return rows
}

export async function getEnrollmentsByCounty() {
  const rows = await sql`
    SELECT county, COUNT(*) AS total
    FROM payments
    WHERE status = 'success'
    GROUP BY county
    ORDER BY total DESC
    LIMIT 10
  `
  return rows
}

export async function getEnrollmentsByReferral() {
  const rows = await sql`
    SELECT COALESCE(NULLIF(referral, ''), 'Direct') AS referral,
      COUNT(*) AS total
    FROM payments
    GROUP BY referral
    ORDER BY total DESC
    LIMIT 8
  `
  return rows
}
