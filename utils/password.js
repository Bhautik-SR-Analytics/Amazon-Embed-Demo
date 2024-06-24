"use server";
import bcrypt from "bcryptjs";

export async function saltAndHashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedPasswordUTF8 = Buffer.from(hashedPassword).toString("utf-8");
  return hashedPasswordUTF8;
}

export async function verifyPassword(plainTextPassword, hashedPassword) {
  try {
    // Compare the plain text password with the hashed password
    const match = await bcrypt.compare(plainTextPassword, hashedPassword);
    return match;
  } catch (error) {
    console.error("Error occurred while verifying password:", error);
    return false;
  }
}
