import { NextResponse } from "next/server";
import { query, execute } from "@/database/connection";
import { requireAuth } from "@/lib/auth";
import { LeaveBalance, Leave } from "@/types";

export async function GET() {
  try {
    const user = await requireAuth("employee");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get leave balance
    let balances = await query<LeaveBalance[]>(
      "SELECT * FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
      [user.id, currentMonth, currentYear]
    );

    if (balances.length === 0) {
      await execute(
        "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, 0, 2) ON DUPLICATE KEY UPDATE employee_id = employee_id",
        [user.id, currentMonth, currentYear]
      );
      balances = [{ id: 0, employee_id: user.id, month: currentMonth, year: currentYear, total_cl: 2, used_cl: 0, remaining_cl: 2 }];
    }

    // Pending leaves count
    const pendingResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE employee_id = ? AND status = 'pending'",
      [user.id]
    );

    // Approved leaves count (this year)
    const approvedResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE employee_id = ? AND status = 'approved' AND YEAR(start_date) = ?",
      [user.id, currentYear]
    );

    // Recent leaves
    const recentLeaves = await query<Leave[]>(
      `SELECT * FROM leaves WHERE employee_id = ? ORDER BY applied_at DESC LIMIT 5`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        leaveBalance: balances[0],
        pendingLeaves: pendingResult[0]?.count || 0,
        approvedLeaves: approvedResult[0]?.count || 0,
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
