export const ADMIN_USERS = [
  { id: "fajar", name: "Fajar", username: "fajar", password: "fajar123tco", role: "admin" },
  { id: "riyuu", name: "Riyuu", username: "riyuu", password: "riyuu123tco", role: "admin" },
  { id: "admin", name: "Admin TCO", username: "admin", password: "tcoadmin2026", role: "superadmin" },
]

export type AdminUser = (typeof ADMIN_USERS)[number]

export function validateAdmin(username: string, password: string): AdminUser | null {
  const user = ADMIN_USERS.find((u) => u.username === username && u.password === password)
  return user || null
}
