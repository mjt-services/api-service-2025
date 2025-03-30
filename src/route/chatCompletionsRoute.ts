import { streamSSE } from "hono/streaming";
import { passDirectToTextgen } from "../passDirectToTextgen";
import type { Router } from "../type/Router";

export const chatCompletionsRoute: Router = (app) => {
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
            stream.writeSSE({
              data: JSON.stringify(data),
            });
          },
        });
        stream.writeSSE({
          data: "[DONE]",
        });

        await stream.close();
      });
    }

    const result = await passDirectToTextgen({
      body,
    });
    return c.json(result);
  });
};
