import { NextResponse } from "next/server";
import { readDB, writeDB, getNextId } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

// POST - reset leave balances for new month (HR only)
export async function POST() {
  try {
    await requireAuth("hr");

    const db = readDB();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // Create balance for all active employees for current month
    const activeEmployees = db.employees.filter((e) => e.status === "active");

    for (const emp of activeEmployees) {
      const exists = db.leave_balance.find(
        (lb) => lb.employee_id === emp.id && lb.month === month && lb.year === year
      );

      if (!exists) {
        db.leave_balance.push({
          id: getNextId(db.leave_balance),
          employee_id: emp.id,
          month,
          year,
          total_cl: 2,
          used_cl: 0,
          remaining_cl: 2,
        });
      }
    }

    writeDB(db);

    return NextResponse.json({
      success: true,
      message: `Leave balances reset for ${month}/${year}. ${activeEmployees.length} employees updated.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Reset balance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
