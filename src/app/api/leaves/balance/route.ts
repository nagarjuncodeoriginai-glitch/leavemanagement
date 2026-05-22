import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/database/connection";
import { requireAuth } from "@/lib/auth";
import { LeaveBalance } from "@/types";

// GET leave balance
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const employeeId = searchParams.get("employee_id");

    let targetId: number;

    if (user.role === "hr" && employeeId) {
      targetId = parseInt(employeeId);
    } else if (user.role === "employee") {
      targetId = user.id;
    } else {
      // HR viewing all balances
      const balances = await query<LeaveBalance[]>(
        "SELECT lb.*, e.full_name, e.emp_id FROM leave_balance lb JOIN employees e ON lb.employee_id = e.id WHERE lb.month = ? AND lb.year = ?",
        [month, year]
      );
      return NextResponse.json({ success: true, data: balances });
    }

    const balances = await query<LeaveBalance[]>(
      "SELECT * FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
      [targetId, month, year]
    );

    if (balances.length === 0) {
      // Create default balance
      await execute(
        "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, 0, 2) ON DUPLICATE KEY UPDATE employee_id = employee_id",
        [targetId, month, year]
      );

      return NextResponse.json({
        success: true,
        data: { employee_id: targetId, month, year, total_cl: 2, used_cl: 0, remaining_cl: 2 },
      });
    }

    return NextResponse.json({ success: true, data: balances[0] });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get balance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
