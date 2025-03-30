/**
 * Interface representing the request payload for the OpenAI Completions API.
 */
export interface OpenAICompletionRequest {
  /**
   * ID of the model to use for generating completions.
   */
  model: string;

  /**
   * The prompt(s) to generate completions for, encoded as a string or array of strings.
   */
  prompt: string | string[];

  /**
   * The maximum number of tokens to generate in the completion.
   */
  max_tokens?: number;

  /**
   * What sampling temperature to use. Higher values mean the model will take more risks.
   */
  temperature?: number;

  /**
   * An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass.
   */
  top_p?: number;

  /**
   * How many completions to generate for each prompt.
   */
  n?: number;

  /**
   * Whether to stream back partial progress. If set, tokens will be sent as data-only server-sent events as they become available.
   */
  stream?: boolean;

  /**
   * Include the log probabilities on the `logprobs` most likely tokens, as well the chosen tokens.
   */
  logprobs?: number;

  /**
   * Echo back the prompt in addition to the completion.
   */
  echo?: boolean;

  /**
   * Up to 4 sequences where the API will stop generating further tokens.
   */
  stop?: string | string[];

  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far.
   */
  frequency_penalty?: number;

  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far.
   */
  presence_penalty?: number;

  /**
   * Modify the likelihood of specified tokens appearing in the completion.
   */
  logit_bias?: { [token: string]: number };

  /**
   * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
   */
  user?: string;
}

/**
 * Interface representing a single choice in the response from the OpenAI Completions API.
 */
export interface OpenAICompletionChoice {
  /**
   * The generated text.
   */
  text: string;

  /**
   * The index of the choice in the returned list.
   */
  index: number;

  /**
   * The log probabilities of the chosen tokens and the top `logprobs` tokens.
   */
  logprobs: {
    tokens: string[];
    token_logprobs: number[];
    top_logprobs: Array<{ [token: string]: number }>;
    text_offset: number[];
  } | null;

  /**
   * The reason the model stopped generating tokens.
   */
  finish_reason: string;
}

/**
 * Interface representing the usage statistics in the response from the OpenAI Completions API.
 */
export interface OpenAICompletionUsage {
  /**
   * Number of tokens in the prompt.
   */
  prompt_tokens: number;

  /**
   * Number of tokens in the generated completion.
   */
  completion_tokens: number;

  /**
   * Total number of tokens used (prompt + completion).
   */
  total_tokens: number;
}

/**
 * Interface representing the response from the OpenAI Completions API.
 */
export interface OpenAICompletionResponse {
  /**
   * The identifier of the completion.
   */
  id: string;

  /**
   * The type of object returned, typically "text_completion".
   */
  object: string;

  /**
   * The creation timestamp of the completion.
   */
  created: number;

  /**
   * The model used for generating the completion.
   */
  model: string;

  /**
   * The list of generated completions.
   */
  choices: OpenAICompletionChoice[];

  /**
   * Usage statistics for the completion request.
   */
  usage: OpenAICompletionUsage;
}
