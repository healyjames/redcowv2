import type { FormData } from "@/libs/types";
import { sendEmail } from "./transport";
import { customerConfirmationHtml } from "./templates/customer";

type SendCustomerConfirmationOptions = {
    mailer: SendEmail;
    data: FormData;
};

export function sendCustomerConfirmation({ mailer, data }: SendCustomerConfirmationOptions) {
    return sendEmail({
        mailer,
        to: data.email,
        subject: "Booking request received - please await confirmation",
        html: customerConfirmationHtml(data),
        text: `Thanks for your booking request on. We'll be in touch to confirm or change your booking request.`,
    });
}
