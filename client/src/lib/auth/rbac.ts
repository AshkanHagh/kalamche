export type Role = keyof typeof ROLES
export type Permission = (typeof ROLES)[Role][number]

export const ROLES = {
  // Roles and permissions
} as const

export const hasPermission = (roles: Role[], permission: Permission) => {
  return roles.some((role) =>
    (ROLES[role] as readonly Permission[]).includes(permission)
  )
}
