import { AllowedRoles } from "@/types/enums";

export function hasAllowedRole(userRoles: string[]): boolean {
  return userRoles.some((role) => Object.values(AllowedRoles).includes(role as AllowedRoles));
}
