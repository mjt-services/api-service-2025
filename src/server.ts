import { Asserts } from "@mjt-engine/assert";
import { getEnv } from "./getEnv";
import { serve } from "@hono/node-server";
import { createApp } from "./createApp";

export const startServer = () => {
  const port = parseInt(Asserts.assertValue(getEnv().LLM_PORT));
  const app = createApp();
  serve({
    fetch: app.fetch,
    port: Number(port),
  });

  console.log(`🚀 Server running on port: ${port}`);
};
