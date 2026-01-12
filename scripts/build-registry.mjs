// Builds registry.json for the shadcn CLI by following each item's imports.
// Run: node scripts/build-registry.mjs && npx shadcn build
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const own = new Set(["text-animate"]); // files in components/ui that are not stock shadcn
const skipPackages = new Set(["react", "react-dom", "next"]);

const resolveLocal = (spec) => {
  const base = path.join(root, spec.replace(/^@\//, ""));
  for (const candidate of [base + ".tsx", base + ".ts", path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (fs.existsSync(candidate)) return path.relative(root, candidate);
  }
  return null;
};

const collect = (entries) => {
  const files = new Set();
  const ui = new Set();
  const packages = new Set();
  const queue = [...entries];

  while (queue.length) {
    const file = queue.pop();
    if (files.has(file)) continue;
    files.add(file);

    const source = fs.readFileSync(path.join(root, file), "utf8");
    const specs = [...source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)].map((m) => m[1]);

    for (let spec of specs) {
      if (spec.startsWith(".")) {
        spec = "@/" + path.join(path.dirname(file), spec);
      }
      if (spec.startsWith("@/components/ui/")) {
        const name = spec.split("/").pop();
        if (!own.has(name)) {
          ui.add(name);
          continue;
        }
      }
      if (spec === "@/lib/utils") continue; // every shadcn project already has it
      if (spec.startsWith("@/")) {
        const local = resolveLocal(spec);
        if (local) queue.push(local);
        continue;
      }
      const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
      if (!skipPackages.has(name) && pkg.dependencies[name]) packages.add(name);
    }
  }

  return { files: [...files].sort(), ui: [...ui].sort(), packages: [...packages].sort() };
};

const fileType = (file) =>
  file.startsWith("hooks/") ? "registry:hook" : file.startsWith("lib/") ? "registry:lib" : "registry:component";

const item = (name, title, description, entries) => {
  const { files, ui, packages } = collect(entries);
  return {
    name,
    type: "registry:block",
    title,
    description,
    dependencies: packages,
    registryDependencies: ui,
    files: files.map((file) => ({ path: file, type: fileType(file) })),
  };
};

const blockDirs = fs
  .readdirSync("components/tool-ui", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "shared")
  .map((entry) => entry.name);

const titleCase = (name) => name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "ai-chat-kit",
  homepage: "https://hackarim.github.io/ai-chat-kit",
  items: [
    ...blockDirs.map((name) =>
      item(name, titleCase(name), `The ${titleCase(name).toLowerCase()} block: component, parser and types.`, [
        `components/tool-ui/${name}/index.ts`,
      ]),
    ),
    item("block-renderer", "Block renderer", "All blocks, the registry and the renderer that turns a fenced block into a component.", [
      "components/tool-ui/block-renderer.tsx",
    ]),
    item("chat-thread", "Chat thread", "The full thread: messages, composer, Markdown with blocks, reasoning, sources, workflow status and voice.", [
      "components/assistant-ui/thread.tsx",
    ]),
  ],
};

fs.writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n");
console.log(`registry.json: ${registry.items.length} items`);
