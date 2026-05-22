import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/database/connection";
import { requireAuth } from "@/lib/auth";
import { Leave, LeaveBalance } from "@/types";

// PUT - Approve/Reject leave (HR only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth("hr");
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Get the leave details
    const leaves = await query<Leave[]>(
      "SELECT * FROM leaves WHERE id = ?",
      [id]
    );

    if (leaves.length === 0) {
      return NextResponse.json(
        { success: false, message: "Leave not found" },
        { status: 404 }
      );
    }

    const leave = leaves[0];

    if (leave.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Leave already processed" },
        { status: 400 }
      );
    }

    // Update leave status
    await execute(
      "UPDATE leaves SET status = ?, reviewed_at = NOW(), reviewed_by = 'HR Admin' WHERE id = ?",
      [action, id]
    );

    // If approved, update leave balance
    if (action === "approved") {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const month = start.getMonth() + 1;
      const year = start.getFullYear();

      // Check if balance exists
      const balances = await query<LeaveBalance[]>(
        "SELECT * FROM leave_balance WHERE employee_id = ? AND month = ? AND year = ?",
        [leave.employee_id, month, year]
      );

      if (balances.length > 0) {
        await execute(
          "UPDATE leave_balance SET used_cl = used_cl + ?, remaining_cl = remaining_cl - ? WHERE employee_id = ? AND month = ? AND year = ?",
          [diffDays, diffDays, leave.employee_id, month, year]
        );
      } else {
        await execute(
          "INSERT INTO leave_balance (employee_id, month, year, total_cl, used_cl, remaining_cl) VALUES (?, ?, ?, 2, ?, ?)",
          [leave.employee_id, month, year, diffDays, 2 - diffDays]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Leave ${action} successfully`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
    console.error("Leave action error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
