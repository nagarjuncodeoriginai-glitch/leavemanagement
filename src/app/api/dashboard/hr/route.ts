import { NextResponse } from "next/server";
import { query } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth("hr");

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total employees
    const totalResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM employees"
    );

    // Active employees
    const activeResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM employees WHERE status = 'active'"
    );

    // Pending leaves
    const pendingResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE status = 'pending'"
    );

    // Approved leaves this month
    const approvedResult = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM leaves WHERE status = 'approved' AND MONTH(start_date) = ? AND YEAR(start_date) = ?",
      [currentMonth, currentYear]
    );

    // Department wise employee count
    const departmentWise = await query<{ department: string; count: number }[]>(
      "SELECT department, COUNT(*) as count FROM employees GROUP BY department ORDER BY count DESC"
    );

    // Recent leave applications
    const recentLeaves = await query(
      `SELECT l.*, e.full_name as employee_name, e.emp_id 
       FROM leaves l 
       JOIN employees e ON l.employee_id = e.id 
       ORDER BY l.applied_at DESC 
       LIMIT 5`
    );

    // Monthly leave usage
    const monthlyUsage = await query(
      `SELECT MONTH(start_date) as month, COUNT(*) as count 
       FROM leaves 
       WHERE YEAR(start_date) = ? AND status = 'approved'
       GROUP BY MONTH(start_date) 
       ORDER BY month`,
      [currentYear]
    );

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees: totalResult[0]?.count || 0,
        activeEmployees: activeResult[0]?.count || 0,
        pendingLeaves: pendingResult[0]?.count || 0,
        approvedLeavesThisMonth: approvedResult[0]?.count || 0,
        departmentWise,
        recentLeaves,
        monthlyUsage,
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
