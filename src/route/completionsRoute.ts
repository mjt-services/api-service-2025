import { toMany } from "@mjt-engine/object";
import { passDirectToTextgen } from "../passDirectToTextgen";
import type { OpenAIPromptCompletionRequest } from "../type/OpenAiTypes";
import type { Router } from "../type/Router";

import { streamSSE } from "hono/streaming";
import { openAiChunkToOpenAIPromptCompletionResponse } from "./openAiChunkToOpenAIPromptCompletionResponse";

export const completionsRoute: Router = (app) => {
  app.post("/v1/completions", async (c) => {
    const body = (await c.req.json()) as OpenAIPromptCompletionRequest;
    const { model, prompt, stream, temperature, stop } = body;

    if (stream) {
      return streamSSE(c, async (stream) => {
        await passDirectToTextgen({
          body: {
            model,
            prompt: toMany(prompt).join("\n"),

            // messages,
            temperature,
            stop,
            stream: true,
          },
          onUpdate: (data) => {
            stream.writeSSE({
              data: JSON.stringify(
                openAiChunkToOpenAIPromptCompletionResponse(data)
              ),
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

    const result = await passDirectToTextgen({
      body: {
        model,
        prompt: toMany(prompt).join("\n"),
        stream: true,
        temperature,
        stop,
      },
    });
    return c.json(openAiChunkToOpenAIPromptCompletionResponse(result));
  });
};
