import type { FormData } from "@/libs/types";
import { transporter } from "./transport";
import { adminBookingHtml } from "./templates/admin";
import {
    SMTP_FROM_NAME,
    SMTP_FROM_EMAIL,
    SMTP_ADMIN_EMAIL,
} from "astro:env/server";

export async function sendAdminBookingEmail(data: FormData) {
    return transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: SMTP_ADMIN_EMAIL,
        replyTo: data.email,
        subject: `New Room Booking: ${data.date} (x${data.guests})`,
        html: adminBookingHtml(data),
        text: `New booking from ${data.firstname} ${data.surname}`,
    });
}
