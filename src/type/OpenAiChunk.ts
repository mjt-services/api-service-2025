//  {"id":"chatcmpl-86","object":"chat.completion.chunk","created":1743277352,"model":"gemma3:4b","system_fingerprint":"fp_ollama","choices":[{"index":0,"delta":{"role":"assistant","content":" you"},"finish_reason":null}]}
export type OpenAiChunk = {
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
