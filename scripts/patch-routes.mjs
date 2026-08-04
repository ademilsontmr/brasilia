import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

export function patchRoutesJson() {
  const routesPath = join(dist, "_routes.json");
  const routes = JSON.parse(readFileSync(routesPath, "utf8"));

  const exclude = new Set(routes.exclude ?? []);

  // Rotas HTML pré-renderizadas — servidas como arquivos estáticos (sem Worker).
  exclude.add("/");
  exclude.add("/index.html");
  exclude.add("/blog");
  exclude.add("/blog/index.html");
  exclude.add("/blog/*");

  // Cloudflare exige ao menos uma regra include quando há _worker.js.
  routes.include = routes.include?.length ? routes.include : ["/*"];
  routes.exclude = [...exclude];

  writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`);
  console.log("✓ _routes.json atualizado — HTML estático excluído do Worker");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  patchRoutesJson();
}
