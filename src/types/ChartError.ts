export type ChartError =
    | { type: "rate_limit"; retryAfter: number }
    | { type: "network" }
    | null;
