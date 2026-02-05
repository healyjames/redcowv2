// src/libs/email/sendCustomerConfirmation.ts
import type { FormData } from "@/libs/types/constants";
import { transporter } from "./transport";
import { customerConfirmationHtml } from "./templates/customer";
import { SMTP_FROM_NAME, SMTP_FROM_EMAIL } from "astro:env/server";

export async function sendCustomerConfirmation(data: FormData) {
    return transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: data.email,
        subject: "Booking request received - please await confirmation",
        html: customerConfirmationHtml(data),
        text: `Thanks for your booking request on. We'll be in touch to confirm or change your booking request.`,
    });
}
