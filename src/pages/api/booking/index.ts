import type { APIRoute } from "astro";
import type { FormData } from "@/libs/types";
import { validateRequest } from "@/libs/utils/validateRequest";
import { checkHoneypot } from "@/libs/utils/honeyPot";
import { sendAdminBookingEmail } from "@/libs/email/sendAdminBookingEmail";
import { sendCustomerConfirmation } from "@/libs/email/sendCustomerConfirmation";
import { SMTP_ADMIN_EMAIL } from "astro:env/server";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.log(`[Booking API ${requestId}] Incoming booking request`);

    try {
        console.log(`[Booking API ${requestId}] Validating request headers and method`);
        const validationResponse = await validateRequest(request);
        if (validationResponse) {
            console.warn(`[Booking API ${requestId}] Request validation failed`);
            return validationResponse;
        }

        console.log(`[Booking API ${requestId}] Parsing request body`);
        const data = await request.json();

        console.log(`[Booking API ${requestId}] Checking honeypot field`);
        if (checkHoneypot(data)) {
            console.warn(`[Booking API ${requestId}] Honeypot triggered - potential spam detected`);
            return new Response(JSON.stringify({ error: "Spam detected." }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log(`[Booking API ${requestId}] Validating required fields`);
        if (!data.firstname || !data.surname || !data.email || !data.date) {
            const missingFields = [];
            if (!data.firstname) missingFields.push("firstname");
            if (!data.surname) missingFields.push("surname");
            if (!data.email) missingFields.push("email");
            if (!data.date) missingFields.push("date");
            console.warn(`[Booking API ${requestId}] Missing required fields: ${missingFields.join(", ")}`);
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

        console.log(`[Booking API ${requestId}] Transforming booking data for: ${data.email}`);
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
        console.log(`[Booking API ${requestId}] Booking date formatted: ${transformedData.date}`);

        console.log(`[Booking API ${requestId}] Sending emails (admin + customer confirmation)`);
        try {
            await Promise.all([
                sendAdminBookingEmail(transformedData),
                sendCustomerConfirmation(transformedData),
            ]);
            console.log(`[Booking API ${requestId}] Emails sent successfully to ${transformedData.email} and admin (${SMTP_ADMIN_EMAIL})`);
        } catch (emailError) {
            console.error(`[Booking API ${requestId}] Email sending failed:`, emailError);
            throw new Error(`Email delivery failed: ${emailError instanceof Error ? emailError.message : "Unknown error"}`);
        }

        console.log(`[Booking API ${requestId}] Booking completed successfully for ${data.firstname} ${data.surname}`);
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
        console.error(`[Booking API ${requestId}] Fatal error during booking:`, error);
        if (error instanceof Error) {
            console.error(`[Booking API ${requestId}] Error message: ${error.message}`);
            console.error(`[Booking API ${requestId}] Error stack:`, error.stack);
        }
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
