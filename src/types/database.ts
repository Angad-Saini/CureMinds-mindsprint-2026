export type UserRole = "patient" | "caretaker";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}