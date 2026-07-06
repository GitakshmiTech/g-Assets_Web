import crypto from "crypto";

function base32ToToBytes(base32) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = String(base32 || "").replace(/=+$/, "").toUpperCase();
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const val = base32chars.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTOTP(secret, counter) {
  const key = base32ToToBytes(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(0, 0);
  buffer.writeUInt32BE(counter, 4);

  const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 1000000).padStart(6, '0');
}

export function verifyTOTP(token, secret) {
  const cleanToken = String(token || "").trim().replace(/\s+/g, "");
  if (cleanToken.length !== 6 || isNaN(Number(cleanToken))) return false;
  
  const counter = Math.floor(Date.now() / 30000);
  for (let i = -1; i <= 1; i++) {
    if (generateTOTP(secret, counter + i) === cleanToken) {
      return true;
    }
  }
  return false;
}

export function generateBase32Secret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}
