import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const root = process.cwd();
const skipDirs = new Set(["node_modules", ".next", "scripts"]);

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) yield* walk(fullPath);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (ext === ".ts" || ext === ".tsx" || ext === ".js" || ext === ".jsx") {
        yield fullPath;
      }
    }
  }
}

let count = 0;
for (const file of walk(root)) {
  let content = readFileSync(file, "utf8");
  const orig = content;
  
  content = content.replace(
    'import { getServerSession } from "next-auth";',
    'import { getServerSession } from "@/lib/get-server-session";'
  );
  content = content.replaceAll("getServerSession(authOptions)", "getServerSession()");
  
  if (content !== orig) {
    writeFileSync(file, content);
    console.log(`  ${file.replace(root, "").replace(/\\/g, "/")}`);
    count++;
  }
}

console.log(`\nFixed ${count} files.`);
