import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { patchRoutesJson } from "./patch-routes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssrEntry = join(root, "node_modules/.nitro/vite/services/ssr/index.js");

function getBlogSlugs() {
  const content = readFileSync(join(root, "src/lib/blog-posts.ts"), "utf8");
  const rawSection = content.split("const rawPosts")[1]?.split("];")[0] ?? "";
  return [...rawSection.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
}

function toOutputPath(routePath) {
  if (routePath === "/") return join(dist, "index.html");
  const clean = routePath.replace(/^\/|\/$/g, "");
  return join(dist, clean, "index.html");
}

async function fetchHtml(handler, routePath) {
  const candidates = [
    `http://127.0.0.1${routePath}`,
    `http://127.0.0.1${routePath.endsWith("/") ? routePath : `${routePath}/`}`,
  ];

  for (const requestUrl of candidates) {
    const response = await handler.fetch(new Request(requestUrl, { redirect: "manual" }));
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        const redirected = await handler.fetch(new Request(new URL(location, requestUrl)));
        if (redirected.ok) return redirected;
      }
      continue;
    }
    if (response.ok) return response;
  }

  throw new Error(`Falha ao pré-renderizar ${routePath}`);
}

async function main() {
  const paths = ["/", "/blog", ...getBlogSlugs().map((slug) => `/blog/${slug}`)];
  const handler = (await import(pathToFileURL(ssrEntry).href)).default;

  for (const routePath of paths) {
    const response = await fetchHtml(handler, routePath);

    const html = await response.text();
    const outputPath = toOutputPath(routePath);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);
    console.log(`✓ ${routePath} → ${outputPath.replace(`${root}/`, "")}`);
  }

  console.log(`\nPré-renderizadas ${paths.length} páginas em dist/`);
  patchRoutesJson();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
