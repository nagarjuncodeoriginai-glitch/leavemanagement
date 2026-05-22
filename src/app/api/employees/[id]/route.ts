import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/database/connection";
import { requireAuth, hashPassword } from "@/lib/auth";

// GET single employee
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const employeeId = parseInt(id);

    const db = readDB();
    const employee = db.employees.find((e) => e.id === employeeId);

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    // Employees can only view their own profile
    if (user.role === "employee" && user.id !== employeeId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { password: _, ...safeEmployee } = employee;
    return NextResponse.json({ success: true, data: safeEmployee });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Get employee error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT update employee
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("hr");
    const { id } = await params;
    const employeeId = parseInt(id);
    const body = await request.json();

    const db = readDB();
    const index = db.employees.findIndex((e) => e.id === employeeId);

    if (index === -1) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    const existing = db.employees[index];

    // Check unique constraints for email/emp_id/username if changed
    if (body.email && body.email !== existing.email) {
      if (db.employees.find((e) => e.email === body.email && e.id !== employeeId)) {
        return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
      }
    }
    if (body.username && body.username !== existing.username) {
      if (db.employees.find((e) => e.username === body.username && e.id !== employeeId)) {
        return NextResponse.json({ success: false, message: "Username already exists" }, { status: 409 });
      }
    }

    // Update fields
    const updated = { ...existing, ...body, id: employeeId, updated_at: new Date().toISOString() };

    // Handle password update
    if (body.password && body.password.trim() !== "") {
      updated.password = await hashPassword(body.password);
    } else {
      updated.password = existing.password;
    }

    db.employees[index] = updated;
    writeDB(db);

    const { password: _, ...safeEmployee } = updated;
    return NextResponse.json({ success: true, data: safeEmployee });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Update employee error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE employee
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("hr");
    const { id } = await params;
    const employeeId = parseInt(id);

    const db = readDB();
    const index = db.employees.findIndex((e) => e.id === employeeId);

    if (index === -1) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    // Remove employee and related data
    db.employees.splice(index, 1);
    db.leaves = db.leaves.filter((l) => l.employee_id !== employeeId);
    db.leave_balance = db.leave_balance.filter((lb) => lb.employee_id !== employeeId);

    writeDB(db);

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Delete employee error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
