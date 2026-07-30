#!/usr/bin/env node
import { spawn } from "node:child_process";
import http from "node:http";

const PORT = 4444;
const HOST = "localhost";
const BASE_URL = `http://${HOST}:${PORT}`;

const EXPECTATIONS = [
  {
    name: "Content-Security-Policy",
    header: "content-security-policy",
    test: /default-src\s+'self'/,
  },
  {
    name: "Strict-Transport-Security",
    header: "strict-transport-security",
    test: /max-age=63072000/,
  },
  {
    name: "X-Frame-Options",
    header: "x-frame-options",
    test: /^DENY$/i,
  },
  {
    name: "X-Content-Type-Options",
    header: "x-content-type-options",
    test: /^nosniff$/i,
  },
  {
    name: "Referrer-Policy",
    header: "referrer-policy",
    test: /^strict-origin-when-cross-origin$/i,
  },
  {
    name: "Permissions-Policy",
    header: "permissions-policy",
    test: /camera=\(\)/,
  },
];

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers }));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Request timed out")); });
  });
}

async function verifyHeaders() {
  console.log("Fetching", `${BASE_URL}/`);
  const { status, headers } = await fetchUrl("/");
  let passed = 0;
  let failed = 0;

  console.log(`Status: ${status}`);
  console.log("");

  for (const { name, header, test } of EXPECTATIONS) {
    const value = headers[header];
    if (value && test.test(String(value))) {
      console.log(`  PASS  ${name}`);
      passed++;
    } else {
      console.log(`  FAIL  ${name} (expected match for ${test}, got ${JSON.stringify(value)})`);
      failed++;
    }
  }

  console.log("");
  console.log(`Result: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function startServer() {
  const server = spawn("npx", ["next", "start", "--port", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production", PORT: String(PORT) },
  });

  server.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Server start timed out")), 30000);

    server.stdout.on("data", (data) => {
      const text = data.toString();
      process.stdout.write(text);
      if (text.includes("Ready") || text.includes("started") || text.includes("localhost")) {
        clearTimeout(timeout);
        // Give the server a moment to stabilize
        setTimeout(() => resolve(server), 1000);
      }
    });

    server.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    server.on("exit", (code) => {
      clearTimeout(timeout);
      if (code !== null) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

async function main() {
  console.log("=== Security Headers Verification ===\n");

  let server;

  try {
    server = await startServer();
    await verifyHeaders();
  } finally {
    if (server) {
      server.kill();
    }
  }
}

main().catch((err) => {
  console.error("Verification failed:", err.message);
  process.exit(1);
});
