/**
 * JSON File-Based Database
 * No MySQL needed! All data stored in db.json file.
 * This is beginner-friendly - just run `npm run dev` and everything works.
 */

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "database", "db.json");

export interface Database {
  hr_admin: HRAdminRecord[];
  employees: EmployeeRecord[];
  leaves: LeaveRecord[];
  leave_balance: LeaveBalanceRecord[];
}

export interface HRAdminRecord {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface EmployeeRecord {
  id: number;
  emp_id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
  department: string;
  designation: string;
  manager_name: string;
  doj: string;
  employment_type: string;
  probation_period: string;
  confirmation_date: string;
  work_location: string;
  shift_timing: string;
  salary_package: string;
  bank_account_number: string;
  ifsc_code: string;
  pan_number: string;
  aadhaar_number: string;
  username: string;
  password: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRecord {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  applied_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface LeaveBalanceRecord {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  total_cl: number;
  used_cl: number;
  remaining_cl: number;
}

// Read the database
export function readDB(): Database {
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return empty database if file doesn't exist
    return { hr_admin: [], employees: [], leaves: [], leave_balance: [] };
  }
}

// Write the database
export function writeDB(data: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Helper: get next ID for a collection
export function getNextId(collection: { id: number }[]): number {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map((item) => item.id)) + 1;
}

// ============ Query helpers (to match old MySQL interface) ============

export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  // This is kept for backward compatibility but won't be used
  void sql;
  void params;
  return [] as unknown as T;
}

export async function queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
  void sql;
  void params;
  return null;
}

export async function execute(sql: string, params?: unknown[]) {
  void sql;
  void params;
  return { affectedRows: 0, insertId: 0 };
}

export default { readDB, writeDB, getNextId };
