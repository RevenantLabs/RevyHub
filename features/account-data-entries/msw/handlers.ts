import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/accounts/*", () => {
    return HttpResponse.json({
      data: {
        "hello": Buffer.from("world").toString("base64")
      }
    });
  })
];
