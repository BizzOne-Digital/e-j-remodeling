import { randomBytes, randomInt } from "node:crypto";
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const makeRef = (prefix: string) => `${prefix}-${Array.from({ length: 8 }, () => ABC[randomInt(ABC.length)]).join("")}`;
export const makeToken = () => randomBytes(24).toString("hex");
