import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const filesToCheck = [
  // API routes (excluding [...nextauth] which still uses authOptions)
  "app/api/academic-years/route.ts",
  "app/api/academic-years/[id]/route.ts",
  "app/api/admin-stats/route.ts",
  "app/api/classes/route.ts",
  "app/api/classes/[id]/route.ts",
  "app/api/clients/route.ts",
  "app/api/clients/[id]/route.ts",
  "app/api/grades/route.ts",
  "app/api/grades/[id]/route.ts",
  "app/api/invoices/route.ts",
  "app/api/invoices/[id]/route.ts",
  "app/api/me/route.ts",
  "app/api/schools/route.ts",
  "app/api/schools/[id]/route.ts",
  "app/api/stripe/cancel-subscription/route.ts",
  "app/api/stripe/checkout/route.ts",
  "app/api/stripe/portal/route.ts",
  "app/api/students/route.ts",
  "app/api/students/[id]/route.ts",
  // Dashboard pages
  "app/dashboard/billing/page.tsx",
  "app/dashboard/stats/page.tsx",
  "app/dashboard/subscription/page.tsx",
  "app/dashboard/users/page.tsx",
  // Pages
  "app/page.tsx",
  "app/upgrade/page.tsx",
];

let count = 0;
for (const relPath of filesToCheck) {
  const fullPath = join(root, relPath);
  let content = readFileSync(fullPath, "utf8");
  const orig = content;
  content = content.replace(/^import.*\{.*authOptions.*\} from.*@\/lib\/auth.*;\s*$/gm, "").replace(/\n{3,}/g, "\n\n");
  if (content !== orig) {
    writeFileSync(fullPath, content);
    console.log(`  ${relPath}`);
    count++;
  }
}
console.log(`\nCleaned ${count} files.`);
