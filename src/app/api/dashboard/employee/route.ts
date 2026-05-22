import { NextResponse } from "next/server";
import { readDB, writeDB, getNextId } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth("employee");

    const db = readDB();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // Get or create leave balance
    let balance = db.leave_balance.find(
      (lb) => lb.employee_id === user.id && lb.month === month && lb.year === year
    );

    if (!balance) {
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
      writeDB(db);
    }

    // Pending leaves count
    const pendingLeaves = db.leaves.filter(
      (l) => l.employee_id === user.id && l.status === "pending"
    ).length;

    // Approved leaves count
    const approvedLeaves = db.leaves.filter(
      (l) => l.employee_id === user.id && l.status === "approved"
    ).length;

    // Recent leaves
    const recentLeaves = db.leaves
      .filter((l) => l.employee_id === user.id)
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        leaveBalance: balance,
        pendingLeaves,
        approvedLeaves,
        recentLeaves,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Employee Dashboard error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
