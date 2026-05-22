import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/database/connection";
import { requireAuth } from "@/lib/auth";
import { leaveApplicationSchema } from "@/lib/validations";
import { Leave, LeaveBalance } from "@/types";
import { ResultSetHeader } from "mysql2";

// GET leaves
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params: unknown[] = [];

    if (user.role === "employee") {
      whereClause = "WHERE l.employee_id = ?";
      params.push(user.id);
    } else {
      whereClause = "WHERE 1=1";
    }

    if (status) {
      whereClause += " AND l.status = ?";
      params.push(status);
    }

    const countResult = await query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM leaves l ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    const leaves = await query<Leave[]>(
      `SELECT l.*, e.full_name as employee_name, e.emp_id 
       FROM leaves l 
       JOIN employees e ON l.employee_id = e.id 
       ${whereClause} 
       ORDER BY l.applied_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: leaves,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get leaves error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST apply for leave (Employee only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("employee");
    const body = await request.json();
    const validation = leaveApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { start_date, end_date, reason } = validation.data;

    // Calculate number of leave days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance for the month
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    const balances = await query<LeaveBalance[]>(
      "SELECT * FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
      [user.id, month, year]
    );

    let balance: LeaveBalance;

    if (balances.length === 0) {
      // Create balance for this month
      await execute(
        "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, 0, 2)",
        [user.id, month, year]
      );
      balance = { id: 0, employee_id: user.id, month, year, total_cl: 2, used_cl: 0, remaining_cl: 2 };
    } else {
      balance = balances[0];
    }

    if (balance.remaining_cl < diffDays) {
      return NextResponse.json(
        { success: false, message: `Insufficient leave balance. You have ${balance.remaining_cl} CL remaining this month.` },
        { status: 400 }
      );
    }

    // Validate dates
    if (start > end) {
      return NextResponse.json(
        { success: false, message: "End date must be after start date" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return NextResponse.json(
        { success: false, message: "Cannot apply for past dates" },
        { status: 400 }
      );
    }

    // Create leave application
    const result = await execute(
      "INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status) VALUES (?, 'CL', ?, ?, ?, 'pending')",
      [user.id, start_date, end_date, reason]
    ) as ResultSetHeader;

    return NextResponse.json(
      { success: true, message: "Leave application submitted successfully", id: result.insertId },
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
    console.error("Apply leave error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
