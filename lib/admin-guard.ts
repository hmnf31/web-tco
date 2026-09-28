import { NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"

export function requireAdmin(
  request: Request
): NextResponse<{ error: string }> | { username: string } {
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  const user = verifyAdminToken(token)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return { username: user.username }
}