import type { OpenAiChunk } from "../type/OpenAiChunk";
import type { OpenAIPromptCompletionResponse } from "../type/OpenAiTypes";


export const openAiChunkToOpenAIPromptCompletionResponse = (
  value: OpenAiChunk
): OpenAIPromptCompletionResponse => {
  return {
    id: value.id,
    object: "text_completion",
    created: value.created,
    model: value.model,
    choices: value.choices.map(
      (choice) => ({
        text: choice.delta.content,
        index: choice.index,
        logprobs: null,
        finish_reason: choice.finish_reason || "",
      } satisfies OpenAIPromptCompletionResponse["choices"][number])
    ),
  };
};
