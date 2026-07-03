import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const HASH_ALGORITHM = "sha256";
const HASH_ITERATIONS = 310000;
const HASH_KEY_LENGTH = 32;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(
    password,
    salt,
    HASH_ITERATIONS,
    HASH_KEY_LENGTH,
    HASH_ALGORITHM,
  ).toString("hex");

  return `pbkdf2_sha256$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  const [scheme, iterationsValue, salt, storedHash] = storedPassword.split("$");

  if (scheme !== "pbkdf2_sha256" || !iterationsValue || !salt || !storedHash) {
    return false;
  }

  const iterations = Number(iterationsValue);

  if (!Number.isInteger(iterations) || iterations < 1) {
    return false;
  }

  const calculatedHash = pbkdf2Sync(
    password,
    salt,
    iterations,
    HASH_KEY_LENGTH,
    HASH_ALGORITHM,
  );
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (calculatedHash.length !== storedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(calculatedHash, storedHashBuffer);
}
