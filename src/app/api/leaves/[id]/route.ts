import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// PUT - approve/reject leave (HR only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth("hr");
    const { id } = await params;
    const leaveId = parseInt(id);
    const body = await request.json();
    const { action } = body; // "approved" or "rejected"

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const db = readDB();
    const leaveIndex = db.leaves.findIndex((l) => l.id === leaveId);

    if (leaveIndex === -1) {
      return NextResponse.json({ success: false, message: "Leave not found" }, { status: 404 });
    }

    const leave = db.leaves[leaveIndex];

    if (leave.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Leave has already been reviewed" },
        { status: 400 }
      );
    }

    // Update leave status
    db.leaves[leaveIndex] = {
      ...leave,
      status: action,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.username,
    };

    // Update leave balance if approved
    if (action === "approved") {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const month = startDate.getMonth() + 1;
      const year = startDate.getFullYear();

      const balanceIndex = db.leave_balance.findIndex(
        (lb) => lb.employee_id === leave.employee_id && lb.month === month && lb.year === year
      );

      if (balanceIndex !== -1) {
        db.leave_balance[balanceIndex].used_cl += days;
        db.leave_balance[balanceIndex].remaining_cl -= days;
      }
    }

    writeDB(db);

    return NextResponse.json({ success: true, data: db.leaves[leaveIndex] });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Leave action error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
