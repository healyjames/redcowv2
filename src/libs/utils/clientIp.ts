export function getClientIP(request: Request) {
    const headers = request.headers;
    return (
        headers.get("x-nf-client-connection-ip") ||
        (headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
        headers.get("cf-connecting-ip") ||
        headers.get("true-client-ip") ||
        (import.meta.env.DEV ? "127.0.0.1" : "unknown")
    );
}
