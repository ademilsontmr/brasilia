import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SITE_URL = "https://cassinodebrasilia.com.br";
const BLOG_DATE = `${new Date().getFullYear()}-06-01`;

const postsContent = readFileSync(join(root, "src/lib/blog-posts.ts"), "utf8");
const rawSection = postsContent.split("const rawPosts")[1]?.split("];")[0] ?? "";
const slugs = [...rawSection.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);

const today = new Date().toISOString().split("T")[0];

const entries = [
  { loc: `${SITE_URL}/`, lastmod: today, changefreq: "weekly", priority: "1.0" },
  { loc: `${SITE_URL}/blog`, lastmod: today, changefreq: "weekly", priority: "0.9" },
  ...slugs.map((slug) => ({
    loc: `${SITE_URL}/blog/${slug}`,
    lastmod: BLOG_DATE,
    changefreq: "monthly",
    priority: "0.7",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml gerado com ${entries.length} URLs → public/sitemap.xml`);
