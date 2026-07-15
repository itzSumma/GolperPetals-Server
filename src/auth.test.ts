import assert from "node:assert/strict";
import {
  createAuthToken,
  hashPassword,
  verifyAuthToken,
  verifyPassword,
} from "./auth.js";

const password = "siam1234";
const passwordHash = await hashPassword(password);

assert.notEqual(passwordHash, password);
assert.equal(await verifyPassword(password, passwordHash), true);
assert.equal(await verifyPassword("wrong-password", passwordHash), false);

const token = await createAuthToken({
  userId: "507f1f77bcf86cd799439011",
  email: "itzsumma11@gmail.com",
});
const payload = await verifyAuthToken(token);

assert.equal(payload.userId, "507f1f77bcf86cd799439011");
assert.equal(payload.email, "itzsumma11@gmail.com");

console.log("auth utility tests passed");
