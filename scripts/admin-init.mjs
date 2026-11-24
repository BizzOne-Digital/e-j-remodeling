// Creates (or, with --reset, resets) the admin account from ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { MONGODB_URI, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD: pw } = process.env;
if (!MONGODB_URI || !ADMIN_EMAIL || !pw || pw.length < 12 || Buffer.byteLength(pw) > 72) {
  console.error("Set MONGODB_URI, ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD (12-72 characters) first.");
  process.exit(1);
}
await mongoose.connect(MONGODB_URI);
const users = mongoose.connection.collection("adminusers");
const email = ADMIN_EMAIL.trim().toLowerCase(), reset = process.argv.includes("--reset");
const existing = await users.findOne({ email });
const now = new Date();
if (existing && !reset) console.log("That admin already exists. Re-run with --reset to set a new password.");
else {
  await users.updateOne({ email }, { $set: { passwordHash: await bcrypt.hash(pw, 12), updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
  if (existing) await mongoose.connection.collection("sessions").deleteMany({ userId: existing._id });
  console.log(existing ? "Password reset and sessions ended." : "Admin account created.");
}
await mongoose.disconnect();
