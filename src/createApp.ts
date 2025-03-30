import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";

import { logger } from "hono/logger";
import type { Env } from "./Env";
import { passDirectToTextgen } from "./passDirectToTextgen";
import { proxyRoute } from "./route/proxyRoute";

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
  app.post("/v1/completions", async (c) => {
    const body = await c.req.json();
    console.log("body", body);

    // const { messages, stream } = body;
  });

  app.post("/v1/chat/completions", async (c) => {
    const body = await c.req.json();
    const { messages, stream } = body;

    if (!Array.isArray(messages)) {
      return c.json({ error: "Invalid messages format" }, 400);
    }

    if (stream) {
      return streamSSE(c, async (stream) => {
        await passDirectToTextgen({
          body,
          onUpdate: (data) => {
            console.log("streaming: ", data);
            stream.writeSSE({
              data: JSON.stringify(data),
            });
          },
          onDone: () => {},
          onError: () => {},
        });
        stream.writeSSE({
          data: "[DONE]",
        });

        await stream.close();
      });
    }

    console.log("non-streaming");
    return c.json({
      id: "chatcmpl-fake",
      object: "chat.completion",
      choices: [
        {
          message: {
            role: "assistant",
            content: "Hello! How can I help?",
          },
          index: 0,
          finish_reason: "stop",
        },
      ],
    });
  });
  return app;
};
