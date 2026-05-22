import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/database/connection";
import { requireAuth, hashPassword } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations";
import { Employee } from "@/types";
import { ResultSetHeader } from "mysql2";

// GET all employees (HR only)
export async function GET(request: NextRequest) {
  try {
    await requireAuth("hr");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params: unknown[] = [];

    if (search) {
      whereClause += " AND (full_name LIKE ? OR emp_id LIKE ? OR email LIKE ? OR department LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (department) {
      whereClause += " AND department = ?";
      params.push(department);
    }

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    const countResult = await query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM employees ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    const employees = await query<Employee[]>(
      `SELECT id, emp_id, full_name, email, phone, gender, date_of_birth, address, department, designation, manager_name, doj, employment_type, probation_period, confirmation_date, work_location, shift_timing, salary_package, bank_account_number, ifsc_code, pan_number, aadhaar_number, username, status, created_at, updated_at FROM employees ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Get employees error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new employee (HR only)
export async function POST(request: NextRequest) {
  try {
    await requireAuth("hr");

    const body = await request.json();
    const validation = employeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;
    const hashedPassword = await hashPassword(data.password);

    const result = await execute(
      `INSERT INTO employees (emp_id, full_name, email, phone, gender, date_of_birth, address, department, designation, manager_name, doj, employment_type, probation_period, confirmation_date, work_location, shift_timing, salary_package, bank_account_number, ifsc_code, pan_number, aadhaar_number, username, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.emp_id, data.full_name, data.email, data.phone, data.gender,
        data.date_of_birth || null, data.address || null, data.department,
        data.designation, data.manager_name || null, data.doj,
        data.employment_type, data.probation_period || null,
        data.confirmation_date || null, data.work_location || null,
        data.shift_timing || null, data.salary_package || null,
        data.bank_account_number || null, data.ifsc_code || null,
        data.pan_number || null, data.aadhaar_number || null,
        data.username, hashedPassword, data.status,
      ]
    ) as ResultSetHeader;

    // Create initial leave balance for current month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await execute(
      `INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, 0, 2)`,
      [result.insertId, currentMonth, currentYear]
    );

    return NextResponse.json(
      { success: true, message: "Employee created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Employee ID, email, or username already exists" },
        { status: 409 }
      );
    }
    console.error("Create employee error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
