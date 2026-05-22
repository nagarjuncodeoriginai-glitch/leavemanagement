import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, getNextId } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const employeeId = searchParams.get("employee_id");

    const db = readDB();

    let targetId: number;

    if (user.role === "hr" && employeeId) {
      targetId = parseInt(employeeId);
    } else if (user.role === "employee") {
      targetId = user.id;
    } else {
      // HR viewing all balances
      const balances = db.leave_balance
        .filter((lb) => lb.month === month && lb.year === year)
        .map((lb) => {
          const emp = db.employees.find((e) => e.id === lb.employee_id);
          return { ...lb, full_name: emp?.full_name, emp_id: emp?.emp_id };
        });
      return NextResponse.json({ success: true, data: balances });
    }

    let balance = db.leave_balance.find(
      (lb) => lb.employee_id === targetId && lb.month === month && lb.year === year
    );

    if (!balance) {
      // Create default balance
      balance = {
        id: getNextId(db.leave_balance),
        employee_id: targetId,
        month,
        year,
        total_cl: 2,
        used_cl: 0,
        remaining_cl: 2,
      };
      db.leave_balance.push(balance);
      writeDB(db);
    }

    return NextResponse.json({ success: true, data: balance });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("Get balance error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
