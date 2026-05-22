import { NextResponse } from "next/server";
import { readDB } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth("hr");

    const db = readDB();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total employees
    const totalEmployees = db.employees.length;

    // Active employees
    const activeEmployees = db.employees.filter((e) => e.status === "active").length;

    // Pending leaves
    const pendingLeaves = db.leaves.filter((l) => l.status === "pending").length;

    // Approved leaves this month
    const approvedLeavesThisMonth = db.leaves.filter((l) => {
      const startDate = new Date(l.start_date);
      return (
        l.status === "approved" &&
        startDate.getMonth() + 1 === currentMonth &&
        startDate.getFullYear() === currentYear
      );
    }).length;

    // Department wise employee count
    const deptMap: Record<string, number> = {};
    db.employees.forEach((e) => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });
    const departmentWise = Object.entries(deptMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    // Recent leave applications
    const recentLeaves = db.leaves
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
      .slice(0, 5)
      .map((leave) => {
        const emp = db.employees.find((e) => e.id === leave.employee_id);
        return {
          ...leave,
          employee_name: emp?.full_name || "Unknown",
          emp_id: emp?.emp_id || "",
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        approvedLeavesThisMonth,
        departmentWise,
        recentLeaves,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("HR Dashboard error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
