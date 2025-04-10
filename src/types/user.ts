export type UserRole = "DOCTOR" | "PATIENT" | "ADMIN";

export interface User {
  email: string;
  name: string;
  role: UserRole;
  userId : string;
}