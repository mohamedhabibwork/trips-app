import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import type { AccessTokenClaims } from "./types";

const DEFAULT_DEV_JWT_SECRET = "trips-enjoy-dev-jwt-secret-key-2026-hmac-sha256-min-32-bytes";
const DEFAULT_DEV_ENCRYPTION_KEY = "trips-enjoy-dev-aes-256-gcm-encryption-key-2026-32bytes!";

function deriveKey32(rawKey?: string): Buffer {
  const source =
    rawKey ||
    (typeof process !== "undefined" ? process.env.AUTH_ENCRYPTION_KEY : undefined) ||
    DEFAULT_DEV_ENCRYPTION_KEY;
  return createHash("sha256").update(source, "utf8").digest();
}

function resolveJwtSecret(rawSecret?: string): string {
  return (
    rawSecret ||
    (typeof process !== "undefined" ? process.env.AUTH_JWT_SECRET : undefined) ||
    DEFAULT_DEV_JWT_SECRET
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhoneE164(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    // Egyptian local mobile format -> +20
    return `+2${cleaned}`;
  }
  return `+${cleaned}`;
}

export function hashSha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function computeBlindIndex(value: string, rawKey?: string): string {
  const key = deriveKey32(rawKey);
  return createHmac("sha256", key).update(value.trim().toLowerCase(), "utf8").digest("hex");
}

export function encryptField(plaintext: string, rawKey?: string): string {
  const key = deriveKey32(rawKey);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptField(ciphertext: string, rawKey?: string): string {
  const parts = ciphertext.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted field format");
  }
  const [ivB64, tagB64, dataB64] = parts as [string, string, string];
  const key = deriveKey32(rawKey);
  const iv = Buffer.from(ivB64, "base64url");
  const authTag = Buffer.from(tagB64, "base64url");
  const encrypted = Buffer.from(dataB64, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 19456,
    timeCost: 2,
  });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await Bun.password.verify(password, passwordHash);
  } catch {
    return false;
  }
}

export function generateNumericOtp(digits = 6): string {
  const max = 10 ** digits;
  const randomInt = randomBytes(4).readUInt32BE(0) % max;
  return randomInt.toString().padStart(digits, "0");
}

export function generateRandomToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function toBase32(buffer: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function fromBase32(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(byteLength = 20): string {
  return toBase32(randomBytes(byteLength));
}

export function buildTotpOtpAuthUri(params: {
  secret: string;
  accountLabel: string;
  issuer?: string;
}): string {
  const issuer = params.issuer ?? "TripsEnjoy";
  const label = encodeURIComponent(`${issuer}:${params.accountLabel}`);
  const query = new URLSearchParams({
    secret: params.secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${query.toString()}`;
}

export function computeTotpCode(
  secret: string,
  timestampMs: number = Date.now(),
  stepSeconds = 30,
): string {
  const counter = Math.floor(timestampMs / 1000 / stepSeconds);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const key = fromBase32(secret);
  const hmac = createHmac("sha1", key).update(counterBuf).digest();
  const offset = (hmac[hmac.length - 1] ?? 0) & 0x0f;
  const binary =
    (((hmac[offset] ?? 0) & 0x7f) << 24) |
    (((hmac[offset + 1] ?? 0) & 0xff) << 16) |
    (((hmac[offset + 2] ?? 0) & 0xff) << 8) |
    ((hmac[offset + 3] ?? 0) & 0xff);
  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, "0");
}

export function verifyTotpCode(
  secret: string,
  code: string,
  timestampMs: number = Date.now(),
  windowSteps = 1,
): boolean {
  const normalizedCode = code.trim();
  if (!/^\d{6}$/.test(normalizedCode)) return false;
  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const candidate = computeTotpCode(secret, timestampMs + offset * 30_000, 30);
    if (timingSafeEqual(Buffer.from(candidate, "utf8"), Buffer.from(normalizedCode, "utf8"))) {
      return true;
    }
  }
  return false;
}

export type { AccessTokenClaims } from "./types";

export function signAccessToken(
  claims: Omit<AccessTokenClaims, "iat" | "exp">,
  options?: { secret?: string; nowMs?: number; ttlSeconds?: number },
): string {
  const nowSec = Math.floor((options?.nowMs ?? Date.now()) / 1000);
  const ttlSec = options?.ttlSeconds ?? 900; // 15 minutes default (FR-AUTH-10, NFR-SEC-03)
  const fullClaims: AccessTokenClaims = {
    ...claims,
    iat: nowSec,
    exp: nowSec + ttlSec,
  };
  const headerB64 = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString(
    "base64url",
  );
  const payloadB64 = Buffer.from(JSON.stringify(fullClaims), "utf8").toString("base64url");
  const signingInput = `${headerB64}.${payloadB64}`;
  const signatureB64 = createHmac("sha256", resolveJwtSecret(options?.secret))
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signatureB64}`;
}

export function verifyAccessToken(
  token: string,
  options?: { secret?: string; nowMs?: number },
): AccessTokenClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts as [string, string, string];
    const signingInput = `${headerB64}.${payloadB64}`;
    const expectedSig = createHmac("sha256", resolveJwtSecret(options?.secret))
      .update(signingInput, "utf8")
      .digest("base64url");

    const actualBuf = Buffer.from(sigB64, "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");
    if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as AccessTokenClaims;

    const nowSec = Math.floor((options?.nowMs ?? Date.now()) / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= nowSec) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
