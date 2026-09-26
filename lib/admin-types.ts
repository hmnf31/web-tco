export type AdminUser = {
  id: string
  name: string
  username: string
  role: "admin" | "superadmin"
}