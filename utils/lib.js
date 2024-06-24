"use server";

const crypto = require("crypto");

export async function generateUserId(username, clientId, clientName, userRole) {
  const userDetailsStr = `${username}${clientId}${clientName}${userRole}`;
  const hashedUserDetails = crypto.createHash("sha256").update(userDetailsStr).digest("hex");
  return hashedUserDetails;
}
