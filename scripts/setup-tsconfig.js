import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
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

console.log(`Generated tsconfig.json with @brand -> src/assets/${brand}`);

const menusSource = resolve(`src/assets/${brand}/menus`);
const menusTarget = resolve("public/menus");

if (!existsSync(menusSource)) {
  console.warn(`Menus directory not found: ${menusSource}`);
  console.warn("  Skipping PDF copy");
} else {
  try {
    mkdirSync(menusTarget, { recursive: true });
    console.log(`Created target directory: public/menus`);

    const pdfFiles = readdirSync(menusSource).filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.warn(`No PDF files found in ${menusSource}`);
    } else {
      pdfFiles.forEach(file => {
        copyFileSync(join(menusSource, file), join(menusTarget, file));
        console.log(`  - ${file}`);
      });

      console.log(`Copied ${pdfFiles.length} PDF file(s) to public/menus`);
    }
  } catch (error) {
    console.error(`Error copying PDFs: ${error.message}`);
    process.exit(1);
  }
}

console.log("\nSetup complete");
