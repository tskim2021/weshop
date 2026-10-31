import express, { type Express } from "express";
import path from "node:path";
export function serveStatic(app: Express) {
  const publicPath = path.resolve(import.meta.dirname, "public");
  app.use(express.static(publicPath));
  app.get("*", (_req, res) => res.sendFile(path.join(publicPath, "index.html")));
}
