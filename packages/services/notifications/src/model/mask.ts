// Masks an email address or phone number for logs and for messages that echo a contact detail.
const VISIBLE_PHONE_DIGITS = 4;

export function maskContact(value: string): string {
  const trimmed = value.trim();
  const at = trimmed.indexOf("@");
  if (at > 0) {
    return `${trimmed.slice(0, 1)}***${trimmed.slice(at)}`;
  }
  if (trimmed.length <= VISIBLE_PHONE_DIGITS) return "***";
  return `***${trimmed.slice(-VISIBLE_PHONE_DIGITS)}`;
}
