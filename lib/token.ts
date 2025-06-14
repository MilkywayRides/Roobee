import { randomBytes } from "crypto";

export async function generateToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString("hex"));
      }
    });
  });
}

export async function generateOTP(): Promise<string> {
  return new Promise((resolve, reject) => {
    randomBytes(3, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        // Convert to 6-digit number and pad with zeros if needed
        const otp = (parseInt(buffer.toString("hex"), 16) % 1000000)
          .toString()
          .padStart(6, "0");
        resolve(otp);
      }
    });
  });
} 