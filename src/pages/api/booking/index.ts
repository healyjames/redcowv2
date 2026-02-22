import type { APIRoute } from "astro";
import type { FormData } from "@/libs/types";
import { validateRequest } from "@/libs/utils/validateRequest";
import { checkHoneypot } from "@/libs/utils/honeyPot";
import { sendAdminBookingEmail } from "@/libs/email/sendAdminBookingEmail";
import { sendCustomerConfirmation } from "@/libs/email/sendCustomerConfirmation";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const validationResponse = await validateRequest(request);
        if (validationResponse) return validationResponse;

        const data = await request.json();
        if (checkHoneypot(data))
            return new Response(JSON.stringify({ error: "Spam detected." }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });

        if (!data.firstname || !data.surname || !data.email || !data.date) {
            return new Response(
                JSON.stringify({
                    error: "Missing required fields",
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const transformedData: FormData = {
            ...data,
            date: new Date(data.date).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
            logo: "", // TODO: host this in public folder and reference here: `${new URL(request.url).origin}/assets/redcow/logo/black.svg`
        };

        await Promise.all([
            sendAdminBookingEmail(transformedData),
            sendCustomerConfirmation(transformedData),
        ]);

        return new Response(
            JSON.stringify({
                success: true,
                message: "Booking received",
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Booking submission error:", error);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
};
