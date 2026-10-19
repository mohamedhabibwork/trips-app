// Hands the authenticator set-up returned by `adminSignIn` (enrollment token, secret, otpauth URI)
// from SCR-PUB-09 to SCR-PUB-10. It is kept in memory only: the secret never reaches storage, and a
// reload sends the admin back to sign in, which issues a fresh enrollment.

export interface AdminEnrollment {
  enrollmentToken: string;
  secret: string;
  otpauthUri: string;
}

let pending: AdminEnrollment | null = null;

export function setAdminEnrollment(enrollment: AdminEnrollment | null): void {
  pending = enrollment;
}

export function getAdminEnrollment(): AdminEnrollment | null {
  return pending;
}

/** Whether a link is safe to offer as "open in authenticator app" (otpauth scheme only). */
export function isOtpAuthUri(value: string): boolean {
  return value.startsWith("otpauth://");
}
