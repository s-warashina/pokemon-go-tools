import { watch } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve("dist");

async function build() {
    await mkdir(distDir, { recursive: true });

    const result = await Bun.build({
        entrypoints: [resolve("src/main.ts")],
        outdir: distDir,
        target: "browser",
        minify: false,
        splitting: false,
        sourcemap: "inline",
    });

    if (!result.success) {
        for (const message of result.logs) {
            console.error(message);
        }
        return false;
    }

    await copyFile(resolve("src/index.html"), resolve(distDir, "index.html"));
    await copyFile(resolve("src/style.css"), resolve(distDir, "style.css"));

    console.log(`[${new Date().toLocaleTimeString()}] Build complete`);
    return true;
}

// 初回ビルド
await build();

// ファイル監視
const srcDir = resolve("src");
watch(srcDir, { recursive: true }, async (eventType, filename) => {
    if (filename) {
        console.log(
            `[${new Date().toLocaleTimeString()}] Changed: ${filename}`,
        );
        await build();
    }
});

// 静的ファイルサーバー
Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        let filePath = url.pathname === "/" ? "/index.html" : url.pathname;

        try {
            const file = Bun.file(resolve(distDir, filePath.slice(1)));
            return new Response(file);
        } catch {
            return new Response("Not Found", { status: 404 });
        }
    },
});

console.log("Dev server running at http://localhost:3000");
console.log("Watching for file changes in src/...");
