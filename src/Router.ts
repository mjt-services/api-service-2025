import { Hono } from "hono";
import type { Env } from "./Env";

export type Router<A = Hono<{ Bindings: Env }>> = (app: A) => void;
