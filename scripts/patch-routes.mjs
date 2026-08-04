import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

/** Remove regras redundantes cobertas por wildcards (ex.: /blog/index.html por /blog/*). */
function dedupeExcludeRules(exclude) {
  const rules = [...exclude];
  const splatRoutes = rules.filter((rule) => rule.endsWith("/*"));

  return rules.filter((rule) => {
    for (const splat of splatRoutes) {
      const prefix = splat.slice(0, -1);
      if (rule !== splat && rule.startsWith(prefix)) return false;
    }
    return true;
  });
}

export function patchRoutesJson() {
  const routesPath = join(dist, "_routes.json");
  const routes = JSON.parse(readFileSync(routesPath, "utf8"));

  const exclude = new Set(routes.exclude ?? []);

  // HTML pré-renderizado — apenas regras não sobrepostas entre si.
  exclude.add("/");
  exclude.add("/index.html");
  exclude.add("/blog");
  exclude.add("/blog/*");

  // Substitui listagem individual de assets por um único glob.
  for (const rule of [...exclude]) {
    if (rule.startsWith("/assets/") && rule !== "/assets/*") exclude.delete(rule);
  }
  exclude.add("/assets/*");

  routes.include = routes.include?.length ? routes.include : ["/*"];
  routes.exclude = dedupeExcludeRules([...exclude]);

  writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`);
  console.log(`✓ _routes.json atualizado (${routes.exclude.length} excludes, sem sobreposição)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  patchRoutesJson();
}
