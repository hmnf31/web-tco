import { NextResponse } from "next/server"
import { createAdminToken, validateAdmin } from "@/lib/admin-auth"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const username = typeof body?.username === "string" ? body.username.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  const user = validateAdmin(username, password)

  if (!user) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })

  try {
    return NextResponse.json({ user, token: createAdminToken(user.username) })
  } catch {
    return NextResponse.json({ error: "Autentikasi server belum dikonfigurasi" }, { status: 500 })
  }
}