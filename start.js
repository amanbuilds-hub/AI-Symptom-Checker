#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting Rural Healthcare Platform...\n");

// Start backend
console.log("📡 Starting backend server...");
const backend = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log("\n🎨 Starting frontend server...");
  const frontend = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
  });

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down servers...");
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  frontend.on("close", (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill();
  });

  backend.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
    frontend.kill();
  });
}, 2000);

backend.on("close", (code) => {
  if (code !== 0) {
    console.error(`❌ Backend failed to start (exit code: ${code})`);
    process.exit(1);
  }
});
