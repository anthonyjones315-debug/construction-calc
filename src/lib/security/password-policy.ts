export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_REQUIREMENTS = [
  `Use ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`,
  "Include at least one uppercase letter",
  "Include at least one lowercase letter",
  "Include at least one number",
  "Include at least one special character",
  "Do not use spaces",
] as const;

export type PasswordPolicyChecks = ReturnType<typeof getPasswordPolicyChecks>;

export function getPasswordPolicyChecks(password: string) {
  return {
    length:
      password.length >= PASSWORD_MIN_LENGTH &&
      password.length <= PASSWORD_MAX_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    noSpaces: !/\s/.test(password),
  };
}

export function isPasswordPolicySatisfied(password: string): boolean {
  return getPasswordPolicyError(password) === null;
}

export function getPasswordPolicyError(password: string): string | null {
  const checks = getPasswordPolicyChecks(password);

  if (!checks.length) {
    if (password.length > PASSWORD_MAX_LENGTH) {
      return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
    }

    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!checks.uppercase) {
    return "Password must include at least one uppercase letter.";
  }

  if (!checks.lowercase) {
    return "Password must include at least one lowercase letter.";
  }

  if (!checks.number) {
    return "Password must include at least one number.";
  }

  if (!checks.special) {
    return "Password must include at least one special character.";
  }

  if (!checks.noSpaces) {
    return "Password cannot contain spaces.";
  }

  return null;
}
