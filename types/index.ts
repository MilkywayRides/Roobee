import { Session } from "next-auth";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}



export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
} 