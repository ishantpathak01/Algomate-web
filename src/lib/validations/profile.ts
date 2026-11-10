import type { StudentProfile } from "@/types/user";

export function validateUsername(username: string): string | null {
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return "Username must be 3–24 characters and use only letters, numbers, or underscores.";
  }
  return null;
}

export function validateProfileUpdate(
  input: Partial<Omit<StudentProfile, "id" | "email" | "coinBalance">>,
): string[] {
  const errors: string[] = [];
  if (input.username) {
    const usernameError = validateUsername(input.username);
    if (usernameError) errors.push(usernameError);
  }
  if (input.about && input.about.length > 1000) errors.push("About must be 1000 characters or fewer.");
  if (input.mobile && !/^[+\d() -]{7,20}$/.test(input.mobile)) errors.push("Enter a valid mobile number.");
  return errors;
}
