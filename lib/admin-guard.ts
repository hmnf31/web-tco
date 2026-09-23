import { NextResponse } from "next/server"
import { validateAdmin } from "@/lib/admin-auth"

export function requireAdmin(
  request: Request
): NextResponse<{ error: string }> | { username: string } {
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  const parts = Buffer.from(token, "base64").toString().split(":")
  const user = validateAdmin(parts[0] || "", parts[1] || "")
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return { username: user.username }
}