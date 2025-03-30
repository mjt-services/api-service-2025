import type { OpenRouterTextgenRequest } from "@mjt-services/textgen-common-2025";
import { getConnection } from "./getConnection";
import type { OpenAiChunk } from "./type/OpenAiChunk";
import { createOpenAiChunkGenerator } from "./createOpenAiChunkGenerator";

export const passDirectToTextgen = async ({
  body,
  onUpdate,
  onDone,
  onError,
}: {
  body: OpenRouterTextgenRequest;
  onUpdate?: (chunk: OpenAiChunk) => void;
  onDone?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const con = await getConnection();
  const toOpenAiChunk = createOpenAiChunkGenerator(body);
  return new Promise<OpenAiChunk>(async (resolve, reject) => {
    try {
      await con.requestMany({
        onResponse: (data) => {
          console.log(data.delta);
          const chunk = toOpenAiChunk(data);
          onUpdate?.(chunk);
          if (data.done) {
            onDone?.();
            resolve(chunk);
          }
        },
        subject: "textgen.generate",
        request: { body },
      });
    } catch (error) {
      onError?.(error);
      reject(error);
    }
  });
};
