import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { readDB } from "@/database/connection";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const db = readDB();

    if (user.role === "hr") {
      const admin = db.hr_admin.find((a) => a.id === user.id);
      if (!admin) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        user: { id: admin.id, username: admin.username, role: "hr" },
      });
    }

    const employee = db.employees.find((e) => e.id === user.id);
    if (!employee) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: employee.id,
        username: employee.username,
        name: employee.full_name,
        emp_id: employee.emp_id,
        role: "employee",
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
