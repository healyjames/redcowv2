import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config();

const brand = process.env.PUBLIC_BRAND;

if (!brand) {
  console.error("Error: PUBLIC_BRAND environment variable is not set");
  process.exit(1);
}

const basePath = resolve("tsconfig.base.json");
const targetPath = resolve("tsconfig.json");
const tsconfig = JSON.parse(readFileSync(basePath, "utf-8"));

tsconfig.compilerOptions.paths["@brand/*"] = [`src/assets/${brand}/*`];

writeFileSync(targetPath, JSON.stringify(tsconfig, null, 4) + "\n");

console.log(`✓ Generated tsconfig.json with @brand -> src/assets/${brand}`);
