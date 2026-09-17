import type { FormData } from "@/libs/types";
import { sendEmail } from "./transport";
import { adminBookingHtml } from "./templates/admin";
import { EMAIL_ADMIN } from "astro:env/server";

type SendAdminBookingEmailOptions = {
    mailer: SendEmail;
    data: FormData;
};

export function sendAdminBookingEmail({ mailer, data }: SendAdminBookingEmailOptions) {
    return sendEmail({
        mailer,
        to: EMAIL_ADMIN,
        replyTo: data.email,
        subject: `New Room Booking: ${data.date} (x${data.guests})`,
        html: adminBookingHtml(data),
        text: `New booking from ${data.firstname} ${data.surname}`,
    });
}
