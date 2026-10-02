import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import handler from "../api/site.js";
const root = resolve("dist");
const port = Number(process.env.PORT || 8093);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
export function safePublicPath(raw) {
  try {
    const path = decodeURIComponent(raw);
    if (
      path
        .split("/")
        .some((part) => part.startsWith(".") || part.includes("\\"))
    )
      return null;
    const full = resolve(root, `.${path}`);
    return full === root || full.startsWith(`${root}/`) ? full : null;
  } catch {
    return null;
  }
}
http
  .createServer(async (req, res) => {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      return res.end();
    }
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    if (
      path === "/journal" ||
      /^\/journal\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ||
      path === "/studio"
    ) {
      res.writeHead(308, { Location: path + "/" + url.search });
      return res.end();
    }
    if (
      path === "/" ||
      path === "/journal/" ||
      /^\/journal\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(path)
    )
      return handler(req, res);
    const file = safePublicPath(path);
    if (!file) {
      res.writeHead(404);
      return res.end("Not found");
    }
    try {
      let target = file;
      try {
        if ((await stat(target)).isDirectory()) target += "/index.html";
      } catch {
        if (path.startsWith("/studio/") && !extname(path))
          target = `${root}/studio/index.html`;
        else throw new Error("missing");
      }
      const data = await readFile(target);
      res.writeHead(200, {
        "Content-Type": types[extname(target)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(
      `Zeeman preview: http://127.0.0.1:${port}/ · Editor: http://127.0.0.1:${port}/studio/`,
    ),
  );
