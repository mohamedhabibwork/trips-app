// Hands the first-sign-in second-factor set-up returned by `staffSignIn` (challenge token, TOTP
// secret, otpauth URI, SMS destination) from SCR-PUB-11 to SCR-PUB-12. Kept in memory only, like the
// admin enrollment: the secret never reaches storage, and a reload starts the sign-in again.

export interface StaffSetup {
  challengeToken: string;
  totpSecret: string | null;
  otpauthUri: string | null;
  /** Where the SMS code was sent, if the account has a phone. */
  smsTarget: string | null;
}

let pending: StaffSetup | null = null;

export function setStaffSetup(setup: StaffSetup | null): void {
  pending = setup;
}

export function getStaffSetup(): StaffSetup | null {
  return pending;
}
