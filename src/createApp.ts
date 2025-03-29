import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { getConnection } from "./getConnection";
import {
  Textgens,
  type OpenRouterTextgenRequest,
} from "@mjt-services/textgen-common-2025";
import { cors } from "hono/cors";

import { logger } from "hono/logger";
import { proxyRoute } from "./proxyRoute";
import type { Env } from "./Env";
type OllamaChunk = {
  message?: {
    role: "assistant" | "user" | "system";
    content: string;
  };
  done?: boolean;
};

//  {"id":"chatcmpl-86","object":"chat.completion.chunk","created":1743277352,"model":"gemma3:4b","system_fingerprint":"fp_ollama","choices":[{"index":0,"delta":{"role":"assistant","content":" you"},"finish_reason":null}]}

type OpenAiChunk = {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  system_fingerprint: string;
  choices: [
    {
      index: number;
      delta: {
        role: "assistant" | "user" | "system";
        content: string;
      };
      finish_reason: null | "stop" | "length" | "content_filter";
    }
  ];
};

export const passDirectToTextgen = async ({
  body,
  onUpdate,
  onDone,
  onError,
}: {
  body: OpenRouterTextgenRequest;
  onUpdate: (chunk: OpenAiChunk) => void;
  onDone: () => void;
  onError: () => void;
}) => {
  const con = await getConnection();
  console.log(JSON.stringify(body, null, 2));
  return new Promise((resolve, reject) => {
    con.requestMany({
      onResponse: (data) => {
        console.log("onResponse", data);
        onUpdate({
          choices: [
            {
              delta: {
                role: "assistant",
                content: data.delta ?? "",
              },
              index: 0,
              finish_reason: null,
            },
          ],
          id: "",
          object: "chat.completion.chunk",
          created: Date.now(),
          model: body.model ?? "",
          system_fingerprint: "fp_ollama",
        });
        if (data.done) {
          onDone();
          resolve(data);
        }
      },
      subject: "textgen.generate",
      request: { body },
    });
  });
};

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
