export type Env = Partial<{
  NATS_URL: string;
  NATS_AUTH_TOKEN: string;
  LLM_PORT: string;
  PROXY_BASE: string;
}>;
