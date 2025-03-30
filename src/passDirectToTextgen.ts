import type { OpenRouterTextgenRequest } from "@mjt-services/textgen-common-2025";
import { getConnection } from "./getConnection";
import type { OpenAiChunk } from "./type/OpenAiChunk";


export const passDirectToTextgen = async ({
  body, onUpdate, onDone, onError,
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
