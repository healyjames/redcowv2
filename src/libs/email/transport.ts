import { EMAIL_FROM, EMAIL_FROM_NAME } from "astro:env/server";

type SendEmailOptions = {
    mailer: SendEmail;
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
};

export function sendEmail({ mailer, to, subject, html, text, replyTo }: SendEmailOptions) {
    return mailer.send({
        from: { name: EMAIL_FROM_NAME, email: EMAIL_FROM },
        to,
        subject,
        html,
        text,
        ...(replyTo ? { replyTo } : {}),
    });
}
