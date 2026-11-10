const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createServer } = require("node:http");
const mongoose = require("mongoose");
const { createApp } = require("../dist/app.js");
const { connectToDatabase } = require("../dist/config/database.js");
const { loadEnvironment } = require("../dist/config/env.js");

let server;
let baseUrl;

before(async () => {
  await mongoose.disconnect();
  server = createServer(createApp({ frontendUrl: "http://localhost:3000", authEnabled: false }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await mongoose.disconnect();
});

test("health reports the API as unavailable while MongoDB is disconnected", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.deepEqual(body.success, false);
  assert.equal(body.error.code, "DATABASE_UNAVAILABLE");
  assert.equal(body.error.details.database, "disconnected");
});

test("unknown API routes use the common not-found response", async () => {
  const response = await fetch(`${baseUrl}/api/not-a-route`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "NOT_FOUND");
});

test("MongoDB connection failures reject without marking the connection as ready", async () => {
  await assert.rejects(connectToDatabase("not-a-valid-mongodb-uri"));
  assert.notEqual(mongoose.connection.readyState, 1);
});

test("environment validation requires the MongoDB connection string", () => {
  assert.throws(
    () => loadEnvironment({ PORT: "5000", FRONTEND_URL: "http://localhost:3000" }),
    /MONGODB_URI is required/,
  );
});

test("authenticated API application cannot be created without Clerk keys", () => {
  assert.throws(() => createApp(), /Clerk keys are required/);
});
