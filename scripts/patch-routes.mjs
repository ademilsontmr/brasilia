import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

function getBlogSlugs() {
  const content = readFileSync(join(root, "src/lib/blog-posts.ts"), "utf8");
  const rawSection = content.split("const rawPosts")[1]?.split("];")[0] ?? "";
  return [...rawSection.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
}

function getPrerenderedPaths() {
  return ["/", "/blog", ...getBlogSlugs().map((slug) => `/blog/${slug}`)];
}

export function patchRoutesJson() {
  const routesPath = join(dist, "_routes.json");
  const routes = JSON.parse(readFileSync(routesPath, "utf8"));

  const prerendered = getPrerenderedPaths();
  const exclude = new Set(routes.exclude ?? []);

  for (const routePath of prerendered) {
    exclude.add(routePath === "/" ? "/index.html" : `${routePath}/index.html`);
    exclude.add(routePath);
  }

  routes.include = [];
  routes.exclude = [...exclude];

  writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`);
  console.log(`✓ _routes.json atualizado — Worker desativado para ${prerendered.length} rotas HTML`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  patchRoutesJson();
}
