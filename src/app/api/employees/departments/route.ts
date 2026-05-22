import { NextResponse } from "next/server";
import { readDB } from "@/database/connection";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth("hr");

    const db = readDB();
    const departments = [...new Set(db.employees.map((e) => e.department))].filter(Boolean);

    return NextResponse.json({ success: true, data: departments });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "Unauthorized" || err.message === "Forbidden") {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 });
    }
    console.error("Get departments error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
