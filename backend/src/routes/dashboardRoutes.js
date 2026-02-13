import express from "express";
import path from "path";

export const dashboardRouter = express.Router();
const webDir = path.resolve("src/web");

dashboardRouter.use("/dashboard", express.static(webDir));
dashboardRouter.get("/", (_req, res) => res.redirect("/dashboard"));
