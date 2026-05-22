import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, getNextId } from "@/database/connection";
import { requireAuth } from "@/lib/auth";
import { leaveApplicationSchema as leaveSchema } from "@/lib/validations";

// GET leaves
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";

    const db = readDB();
    let leaves = [...db.leaves];

    // Employees can only see their own leaves
    if (user.role === "employee") {
      leaves = leaves.filter((l) => l.employee_id === user.id);
    }

    // Filter by status
    if (status) {
      leaves = leaves.filter((l) => l.status === status);
    }

    // Sort by most recent
    leaves.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

    const total = leaves.length;
    const offset = (page - 1) * limit;
    const paginatedLeaves = leaves.slice(offset, offset + limit);

    // Add employee info for HR view
    const leavesWithEmployee = paginatedLeaves.map((leave) => {
      const emp = db.employees.find((e) => e.id === leave.employee_id);
      return {
        ...leave,
        employee_name: emp?.full_name || "Unknown",
        emp_id: emp?.emp_id || "",
      };
    });

    return NextResponse.json({
      success: true,
      data: leavesWithEmployee,
      total,
      page,
      limit,
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

// POST - apply for leave
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("employee");
    const body = await request.json();
    const validation = leaveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { start_date, end_date, reason } = validation.data;
    const db = readDB();

    // Calculate leave days
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();
    let balance = db.leave_balance.find(
      (lb) => lb.employee_id === user.id && lb.month === month && lb.year === year
    );

    if (!balance) {
      // Create balance entry
      balance = {
        id: getNextId(db.leave_balance),
        employee_id: user.id,
        month,
        year,
        total_cl: 2,
        used_cl: 0,
        remaining_cl: 2,
      };
      db.leave_balance.push(balance);
    }

    if (balance.remaining_cl < days) {
      return NextResponse.json(
        { success: false, message: `Insufficient leave balance. You have ${balance.remaining_cl} CL remaining this month.` },
        { status: 400 }
      );
    }

    // Create leave
    const newLeave = {
      id: getNextId(db.leaves),
      employee_id: user.id,
      leave_type: "CL",
      start_date,
      end_date,
      reason,
      status: "pending",
      applied_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
    };

    db.leaves.push(newLeave);
    writeDB(db);

    return NextResponse.json({ success: true, data: newLeave }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Apply leave error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
