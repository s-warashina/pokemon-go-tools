import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve("dist");

await mkdir(distDir, { recursive: true });

const result = await Bun.build({
  entrypoints: [resolve("src/main.ts")],
  outdir: distDir,
  target: "browser",
  minify: true,
  splitting: false,
  sourcemap: "none",
});

if (!result.success) {
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

await copyFile(resolve("src/index.html"), resolve(distDir, "index.html"));
await copyFile(resolve("src/style.css"), resolve(distDir, "style.css"));

console.log("Build complete: dist/");
