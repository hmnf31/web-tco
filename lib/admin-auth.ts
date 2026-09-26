import { createHmac, timingSafeEqual } from "crypto"
import type { AdminUser } from "./admin-types"

type ConfiguredAdmin = AdminUser & { password: string }
const TOKEN_TTL_SECONDS = 60 * 60 * 8

function getAdmins(): ConfiguredAdmin[] {
  const raw = process.env.ADMIN_USERS_JSON
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getSecret(): string {
  const secret = process.env.ADMIN_AUTH_SECRET
  if (!secret) throw new Error("ADMIN_AUTH_SECRET is not configured")
  return secret
}

export function validateAdmin(username: string, password: string): AdminUser | null {
  const user = getAdmins().find((candidate) => candidate.username === username && candidate.password === password)
  if (!user) return null
  const { password: _password, ...publicUser } = user
  return publicUser
}

export function createAdminToken(username: string): string {
  const payload = Buffer.from(JSON.stringify({ username, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })).toString("base64url")
  const signature = createHmac("sha256", getSecret()).update(payload).digest("base64url")
  return `${payload}.${signature}`
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const [payload, signature] = token.split(".")
    if (!payload || !signature) return null
    const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url")
    const actualBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { username?: string; exp?: number }
    if (!data.username || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null
    const user = getAdmins().find((candidate) => candidate.username === data.username)
    if (!user) return null
    const { password: _password, ...publicUser } = user
    return publicUser
  } catch {
    return null
  }
}
