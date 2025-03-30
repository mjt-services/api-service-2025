import { Hono } from "hono";
import { cors } from "hono/cors";

import { logger } from "hono/logger";
import type { Env } from "./Env";
import { chatCompletionsRoute } from "./route/chatCompletionsRoute";
import { completionsRoute } from "./route/completionsRoute";
import { proxyRoute } from "./route/proxyRoute";
import { ollamaChatRoute } from "./route/ollamaChatRoute";

export const createApp = () => {
  const app = new Hono<{ Bindings: Env }>();

  app.use("*", logger());

  app.use(
    "*",
    cors({
      origin: "*",
      allowHeaders: ["*"],
      allowMethods: ["*"],
      maxAge: 3600,
    })
  );

  app.get("/", (c) => c.text("API service running"));

  proxyRoute(app);
  chatCompletionsRoute(app);
  completionsRoute(app);
  ollamaChatRoute(app);

  return app;
};
