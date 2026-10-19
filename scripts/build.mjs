import { readFile, writeFile, mkdir, cp, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { decorate } from "../lib/site.mjs";
import { composeHomeOverview } from "../lib/home-overview.mjs";
import { JOURNAL_ENABLED } from "../lib/features.mjs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const templates = {
  home: composeHomeOverview(await readFile("index.html", "utf8"), await readFile("work/index.html", "utf8")),
  journal: await readFile("journal/index.html", "utf8"),
  article: await readFile(
    "journal/translation-beyond-language/index.html",
    "utf8",
  ),
};
await mkdir("lib", { recursive: true });
await writeFile(
  "lib/generated-templates.mjs",
  `export default ${JSON.stringify(templates)};\n`,
);
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const item of [
  "assets",
  "about",
  "contact",
  "privacy",
  "services",
  "work",
  "robots.txt",
  "sitemap.xml",
])
  await cp(item, `dist/${item}`, { recursive: true });
async function decorateDir(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await decorateDir(p);
    else if (p.endsWith(".html")) {
      await writeFile(p, decorate(await readFile(p, "utf8")));
    }
  }
}
for (const dir of ["about", "contact", "privacy", "services", "work"])
  await decorateDir(`dist/${dir}`);
if (JOURNAL_ENABLED) {
const result = spawnSync(
  "node_modules/.bin/sanity",
  ["build", "dist/studio", "--yes"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      SANITY_STUDIO_PROJECT_ID:
        process.env.SANITY_STUDIO_PROJECT_ID ||
        process.env.SANITY_API_PROJECT_ID,
      SANITY_STUDIO_DATASET:
        process.env.SANITY_STUDIO_DATASET || process.env.SANITY_API_DATASET,
    },
  },
);
if (result.status !== 0) process.exit(result.status || 1);
}
console.log(JOURNAL_ENABLED ? "Website and connected Journal Studio built." : "Website built. Journal and Studio are paused.");
