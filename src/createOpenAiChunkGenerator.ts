import type { TextgenConnectionMap } from "@mjt-services/textgen-common-2025";
import type { OpenAiChunk } from "./type/OpenAiChunk";


export const createOpenAiChunkGenerator = (body: TextgenConnectionMap["textgen.generate"]["request"]["body"]) => (data: TextgenConnectionMap["textgen.generate"]["response"]): OpenAiChunk => {
  return {
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
  };
};
