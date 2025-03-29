import { TransformStream } from "node:stream/web";
import { fetch } from "undici";
import type { Router } from "./Router";
import { getEnv } from "./getEnv";
import { Asserts } from "@mjt-engine/assert";

export const proxyRoute: Router = (app) => {
  app.all("/proxy/:path{.*}", async (c) => {
    const path = c.req.param("path");
    const proxyBase = Asserts.assertValue(getEnv().PROXY_BASE);
    const url = `${proxyBase}/${path}`;
    const method = c.req.method;
    const rawUrl = new URL(c.req.raw.url);
    const passedQueryParams =
      rawUrl.searchParams.size > 0 ? `?${rawUrl.searchParams.toString()}` : "";
    console.log(
      `PROXY ${method} ${url} params: '${passedQueryParams.toString()}'`
    );

    const fullUrl = `${url}${passedQueryParams}`;
    console.log(`PROXY ${method} ${fullUrl}`);

    const body = method.toUpperCase() === "GET" ? undefined : c.req.raw.body;
    console.log("Request Headers", c.req.raw.headers);
    const response = await fetch(fullUrl, {
      method: c.req.method,
      // @ts-ignore
      headers: c.req.raw.headers,
      duplex: "half",
      // @ts-ignore
      body,
    });
    console.log(`PROXY ${method} ${fullUrl} response: ${response.status}`);
    if (!response.ok) {
      // @ts-ignore
      return new Response(response.body, { status: 500 });
    }
    if (!response.body) {
      return new Response(undefined, { status: response.status });
    }

    console.log("Response Headers", response.headers);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const abortController = new AbortController();
    const signal = abortController.signal;
    const consumer = async (value: unknown | undefined, done: boolean) => {
      try {
        // decode value to text string then log
        const decodedValue =
          value instanceof Uint8Array ? new TextDecoder().decode(value) : value;
        console.log(decodedValue);
        if (done) {
          writer.close();
          abortController.abort();
          return true;
        }
        writer.write(value);
      } catch (err) {
        console.log(err);
        abortController.abort();
        return true;
      }
    };

    const reader = response.body.pipeThrough(new TransformStream()).getReader();

    const piper = async () => {
      try {
        while (!signal.aborted) {
          const { value, done } = await reader.read();
          if (done) {
            consumer(undefined, done);
            break;
          }
          if (await consumer(value, done)) {
            break;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        console.log("closing piper");
        reader.cancel();
      }
    };

    piper();

    // @ts-ignore
    return new Response(readable, {
      headers: response.headers,
    });
  });
};
