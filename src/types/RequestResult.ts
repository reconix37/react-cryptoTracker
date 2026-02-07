export type RequestResult<T> =
    | { status: "success"; data: T }
    | { status: "rate_limit"; retryAfter: number }
    | { status: "error" }
    | { status: "aborted" };