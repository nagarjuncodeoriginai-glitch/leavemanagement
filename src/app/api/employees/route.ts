import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, getNextId } from "@/database/connection";
import { requireAuth } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations";

// GET all employees (with search, pagination, filters)
export async function GET(request: NextRequest) {
  try {
    await requireAuth("hr");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";

    const db = readDB();
    let employees = [...db.employees];

    // Apply filters
    if (search) {
      const s = search.toLowerCase();
      employees = employees.filter(
        (e) =>
          e.full_name.toLowerCase().includes(s) ||
          e.emp_id.toLowerCase().includes(s) ||
          e.email.toLowerCase().includes(s) ||
          e.department.toLowerCase().includes(s)
      );
    }
    if (department) {
      employees = employees.filter((e) => e.department === department);
    }
    if (status) {
      employees = employees.filter((e) => e.status === status);
    }

    const total = employees.length;
    const offset = (page - 1) * limit;
    const paginatedEmployees = employees.slice(offset, offset + limit);

    // Remove passwords from response
    const safeEmployees = paginatedEmployees.map(({ password, ...emp }) => emp);

    return NextResponse.json({
      success: true,
      data: safeEmployees,
      total,
      page,
      limit,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Get employees error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST - create new employee
export async function POST(request: NextRequest) {
  try {
    await requireAuth("hr");

    const body = await request.json();
    const validation = employeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const db = readDB();

    // Check duplicates
    if (db.employees.find((e) => e.emp_id === data.emp_id)) {
      return NextResponse.json({ success: false, message: "Employee ID already exists" }, { status: 409 });
    }
    if (db.employees.find((e) => e.email === data.email)) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
    }
    if (db.employees.find((e) => e.username === data.username)) {
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(data.password);
    const now = new Date().toISOString();

    const newEmployee = {
      id: getNextId(db.employees),
      emp_id: data.emp_id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      gender: data.gender || "Male",
      date_of_birth: data.date_of_birth || "",
      address: data.address || "",
      department: data.department,
      designation: data.designation,
      manager_name: data.manager_name || "",
      doj: data.doj,
      employment_type: data.employment_type || "Full-Time",
      probation_period: data.probation_period || "",
      confirmation_date: data.confirmation_date || "",
      work_location: data.work_location || "",
      shift_timing: data.shift_timing || "",
      salary_package: data.salary_package || "",
      bank_account_number: data.bank_account_number || "",
      ifsc_code: data.ifsc_code || "",
      pan_number: data.pan_number || "",
      aadhaar_number: data.aadhaar_number || "",
      username: data.username,
      password: hashedPassword,
      status: data.status || "active",
      created_at: now,
      updated_at: now,
    };

    db.employees.push(newEmployee);

    // Create leave balance for current month
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    db.leave_balance.push({
      id: getNextId(db.leave_balance),
      employee_id: newEmployee.id,
      month,
      year,
      total_cl: 2,
      used_cl: 0,
      remaining_cl: 2,
    });

    writeDB(db);

    const { password: _, ...safeEmployee } = newEmployee;
    return NextResponse.json({ success: true, data: safeEmployee }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Create employee error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
