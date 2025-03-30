import { toMany } from "@mjt-engine/object";
import type { OpenRouterMessage } from "@mjt-services/textgen-common-2025";
import { streamSSE } from "hono/streaming";
import { passDirectToTextgen } from "../passDirectToTextgen";
import type { OpenAIPromptCompletionRequest } from "../type/OpenAiTypes";
import type { Router } from "../type/Router";
import { openAiChunkToOpenAIPromptCompletionResponse } from "./openAiChunkToOpenAIPromptCompletionResponse";


export const ollamaChatRoute: Router = (app) => {
  app.post("/v1/api/chat", async (c) => {
    const body = (await c.req.json()) as OpenAIPromptCompletionRequest;
    console.log("body", body);
    const { model, prompt, stream, temperature, stop } = body;
    const messages: OpenRouterMessage[] = [
      {
        role: "system",
        content: toMany(prompt).join("\n"),
      },
      {
        role: "user",
        content: "Note that the response is already started. Continue the response from the assistant.",
      },
    ];

    if (stream) {
      return streamSSE(c, async (stream) => {
        await passDirectToTextgen({
          body: {
            model,

            messages,
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
          onDone: () => { },
          onError: () => { },
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
        messages,
        stream: true,
        temperature,
        stop,
      },
    });
    return c.json(openAiChunkToOpenAIPromptCompletionResponse(result));
  });
};
