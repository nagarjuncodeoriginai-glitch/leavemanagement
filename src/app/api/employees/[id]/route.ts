import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/database/connection";
import { requireAuth, hashPassword } from "@/lib/auth";
import { Employee } from "@/types";

// GET single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    let employee: Employee | null = null;

    if (user.role === "hr") {
      const employees = await query<Employee[]>(
        "SELECT id, emp_id, full_name, email, phone, gender, date_of_birth, address, department, designation, manager_name, doj, employment_type, probation_period, confirmation_date, work_location, shift_timing, salary_package, bank_account_number, ifsc_code, pan_number, aadhaar_number, username, status, created_at, updated_at FROM employees WHERE id = ?",
        [id]
      );
      employee = employees[0] || null;
    } else {
      // Employees can only view their own profile
      const employees = await query<Employee[]>(
        "SELECT id, emp_id, full_name, email, phone, gender, date_of_birth, address, department, designation, manager_name, doj, employment_type, probation_period, confirmation_date, work_location, shift_timing, salary_package, bank_account_number, ifsc_code, pan_number, aadhaar_number, username, status, created_at, updated_at FROM employees WHERE id = ?",
        [user.id]
      );
      employee = employees[0] || null;
    }

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update employee (HR only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("hr");
    const { id } = await params;
    const body = await request.json();

    // Build dynamic update query
    const allowedFields = [
      "full_name", "email", "phone", "gender", "date_of_birth", "address",
      "department", "designation", "manager_name", "doj", "employment_type",
      "probation_period", "confirmation_date", "work_location", "shift_timing",
      "salary_package", "bank_account_number", "ifsc_code", "pan_number",
      "aadhaar_number", "username", "status",
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    // Handle password update separately
    if (body.password) {
      const hashedPassword = await hashPassword(body.password);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    await execute(
      `UPDATE employees SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ success: true, message: "Employee updated successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE employee (HR only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("hr");
    const { id } = await params;

    await execute("DELETE FROM employees WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
