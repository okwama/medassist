import mysql from 'mysql2/promise'
import { PaymentRecord } from '@/types'
import fs from 'fs'
import path from 'path'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '102.210.146.74',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'gizmojun_payments',
  password: process.env.MYSQL_PASSWORD || 'RAj8yQPMpGC8ze8kTa7p',
  database: process.env.MYSQL_DATABASE || 'gizmojun_payments',
  waitForConnections: true,
  connectionLimit: 10,
})

const localDbPath = path.join(process.cwd(), 'payments_db.json')
let useLocalFile = false

// Helper to read local JSON database
const readLocalDb = (): PaymentRecord[] => {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify([]))
    return []
  }
  try {
    const data = fs.readFileSync(localDbPath, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Helper to write local JSON database
const writeLocalDb = (data: PaymentRecord[]) => {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2))
}

// Helper to execute query with MySQL or local file fallback
async function executeQuery<T>(mysqlFn: () => Promise<T>, fallbackFn: () => T | Promise<T>): Promise<T> {
  if (useLocalFile) {
    return fallbackFn()
  }
  try {
    return await mysqlFn()
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.syscall === 'connect' || err.message?.includes('connect')) {
      console.warn('MySQL connection refused. Falling back to local payments_db.json database.')
      useLocalFile = true
      return fallbackFn()
    }
    throw err;
  }
}

// Auto-initialize the database table
export async function initDb() {
  return executeQuery(
    async () => {
      const conn = await pool.getConnection()
      await conn.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          reference       VARCHAR(50)  NOT NULL UNIQUE,
          name            VARCHAR(100) NOT NULL,
          email           VARCHAR(100) NOT NULL,
          phone           VARCHAR(20)  NOT NULL,
          county          VARCHAR(50)  NOT NULL,
          study_level     VARCHAR(50)  NOT NULL,
          referral        VARCHAR(50)  NOT NULL,
          course          VARCHAR(100) NOT NULL,
          amount          INT          NOT NULL DEFAULT 8000,
          status          ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
          mpesa_receipt   VARCHAR(50)  NULL,
          checkout_request_id VARCHAR(100) NULL,
          created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
          paid_at         DATETIME     NULL,
          INDEX idx_reference (reference),
          INDEX idx_status (status),
          INDEX idx_email (email)
        )
      `)
      conn.release()
      console.log('MySQL Database initialized successfully')
    },
    () => {
      if (!fs.existsSync(localDbPath)) {
        writeLocalDb([])
      }
      console.log('Local JSON Database initialized successfully')
    }
  )
}

export async function insertPayment(record: PaymentRecord) {
  return executeQuery(
    async () => {
      await pool.execute(
        `INSERT INTO payments 
         (reference, name, email, phone, county, study_level, referral, course, amount, status, checkout_request_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          record.reference,
          record.name,
          record.email,
          record.phone,
          record.county,
          record.study_level,
          record.referral,
          record.course,
          record.amount,
          record.checkout_request_id || null
        ]
      )
    },
    () => {
      const db = readLocalDb()
      db.push({
        ...record,
        status: 'pending',
        created_at: new Date()
      })
      writeLocalDb(db)
    }
  )
}

export async function updatePaymentStatus(
  reference: string,
  status: 'success' | 'failed',
  mpesaReceipt?: string
) {
  return executeQuery(
    async () => {
      await pool.execute(
        `UPDATE payments SET status = ?, mpesa_receipt = ?, paid_at = ?
         WHERE reference = ?`,
        [status, mpesaReceipt || null, status === 'success' ? new Date() : null, reference]
      )
    },
    () => {
      const db = readLocalDb()
      const item = db.find(p => p.reference === reference)
      if (item) {
        item.status = status
        item.mpesa_receipt = mpesaReceipt
        item.paid_at = status === 'success' ? new Date() : undefined
        writeLocalDb(db)
      }
    }
  )
}

export async function updatePaymentStatusByCheckoutRequestId(
  checkoutRequestId: string,
  status: 'success' | 'failed',
  mpesaReceipt?: string
) {
  return executeQuery(
    async () => {
      await pool.execute(
        `UPDATE payments SET status = ?, mpesa_receipt = ?, paid_at = ?
         WHERE checkout_request_id = ?`,
        [status, mpesaReceipt || null, status === 'success' ? new Date() : null, checkoutRequestId]
      )
    },
    () => {
      const db = readLocalDb()
      const item = db.find(p => p.checkout_request_id === checkoutRequestId)
      if (item) {
        item.status = status
        item.mpesa_receipt = mpesaReceipt
        item.paid_at = status === 'success' ? new Date() : undefined
        writeLocalDb(db)
      }
    }
  )
}

export async function getPaymentByReference(reference: string): Promise<PaymentRecord | null> {
  return executeQuery(
    async () => {
      const [rows] = await pool.execute<any[]>(
        'SELECT * FROM payments WHERE reference = ? LIMIT 1',
        [reference]
      )
      return rows[0] || null
    },
    () => {
      const db = readLocalDb()
      return db.find(p => p.reference === reference) || null
    }
  )
}

export async function getPaymentByCheckoutRequestId(checkoutRequestId: string): Promise<PaymentRecord | null> {
  return executeQuery(
    async () => {
      const [rows] = await pool.execute<any[]>(
        'SELECT * FROM payments WHERE checkout_request_id = ? LIMIT 1',
        [checkoutRequestId]
      )
      return rows[0] || null
    },
    () => {
      const db = readLocalDb()
      return db.find(p => p.checkout_request_id === checkoutRequestId) || null
    }
  )
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  return executeQuery(
    async () => {
      const [rows] = await pool.execute<any[]>(
        'SELECT * FROM payments ORDER BY created_at DESC'
      )
      return rows
    },
    () => {
      const db = readLocalDb()
      return db.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
    }
  )
}

export async function getPaymentStats() {
  return executeQuery(
    async () => {
      const [rows] = await pool.execute<any[]>(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as paid,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'failed'  THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as revenue
        FROM payments
      `)
      return rows[0] || { total: 0, paid: 0, pending: 0, failed: 0, revenue: 0 }
    },
    () => {
      const db = readLocalDb()
      const total = db.length
      const paid = db.filter(p => p.status === 'success').length
      const pending = db.filter(p => p.status === 'pending').length
      const failed = db.filter(p => p.status === 'failed').length
      const revenue = db.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0)
      return { total, paid, pending, failed, revenue }
    }
  )
}

export { pool }

