// Local demo: runs the site against a throwaway in-memory MongoDB. Pass "start" to serve the production build.
import { spawn } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";
const mode = process.argv[2] === "start" ? "start" : "dev", port = process.env.PORT || "3000";
const mongo = await MongoMemoryServer.create();
const env = {
  ...process.env, PORT: port, MONGODB_URI: mongo.getUri("ej"), AUTH_SECRET: "local-demo-secret-local-demo-secret-1234",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`, ADMIN_EMAIL: "admin@example.com", ADMIN_INITIAL_PASSWORD: "local-demo-password",
};
console.log("In-memory MongoDB ready:", env.MONGODB_URI, "\nLocal admin: admin@example.com / local-demo-password");
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", mode, "-p", port], { env, stdio: "inherit" });
const stop = async () => { child.kill(); await mongo.stop(); process.exit(); };
process.on("SIGINT", stop); process.on("SIGTERM", stop); child.on("exit", stop);
