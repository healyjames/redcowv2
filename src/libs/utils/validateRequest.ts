import { isOriginAllowed } from "@/libs/utils/botDetection";
import { isUserAgentBlocked } from "@/libs/utils/botDetection";
import { getClientIP } from "@/libs/utils/clientIp";
import { checkRateLimit } from "@/libs/utils/rateLimiter";

export async function validateRequest(
    request: Request
): Promise<Response | null> {
    const origin = request.headers.get("origin");
    if (!isOriginAllowed(origin)) {
        return new Response(JSON.stringify({ error: "Invalid origin" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    const ua = request.headers.get("user-agent");
    if (isUserAgentBlocked(ua)) {
        return new Response(JSON.stringify({ error: "Blocked user agent" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    const ip = getClientIP(request);
    if (!ip || ip === "unknown") {
        return new Response(
            JSON.stringify({ error: "Unable to determine client IP" }),
            {
                status: 403,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    try {
        const rl = await checkRateLimit(ip);
        if (rl.exceeded) {
            return new Response(
                JSON.stringify({ error: "Rate limit exceeded" }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(rl.resetIn),
                    },
                }
            );
        }
    } catch (err) {
        // fail-open: if Upstash fails, allow the request but log it
        console.error("Rate limit check failed, allowing request:", err);
    }

    // All validations passed
    return null;
}
