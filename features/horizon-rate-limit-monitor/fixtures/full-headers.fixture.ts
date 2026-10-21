/** Fixed future epoch keeps the browser journey deterministic. */
export const fullHeaders = {
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "8",
  "X-RateLimit-Reset": "2000000000"
};
export const healthyHeaders = { ...fullHeaders, "X-RateLimit-Remaining": "500" };
