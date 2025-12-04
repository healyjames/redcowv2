import { RESEND_API_KEY } from "astro:env/server";
import type { FormData } from "@/libs/types/constants";
import { generateEmailHTML } from "@/libs/email/generateEmailHtml";

export async function sendEmailWithResend(data: FormData) {
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: "noreply@redcownantwich.co.uk",
            to: data.email, // TODO: Change to redcow info email
            subject: `New Booking Request - ${data.date} (x${data.guests})`,
            html: generateEmailHTML(data),
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to send email");
    }
}
