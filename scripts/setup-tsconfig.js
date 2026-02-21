import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config();

const brand = process.env.PUBLIC_BRAND;

if (!brand) {
  console.error("Error: PUBLIC_BRAND environment variable is not set");
  process.exit(1);
}

const tsconfigPath = resolve("tsconfig.json");
const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));

tsconfig.compilerOptions.paths["@brand/*"] = [`src/assets/${brand}/*`];

writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 4) + "\n");

console.log(`✓ Updated tsconfig.json with @brand -> src/assets/${brand}`);
