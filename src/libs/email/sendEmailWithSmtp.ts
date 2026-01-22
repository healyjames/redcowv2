import nodemailer from "nodemailer";
import type { FormData } from "@/libs/types/constants";
import { generateEmailHTML } from "@/libs/email/generateEmailHtml";
import {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM_NAME,
    SMTP_FROM_EMAIL,
    SMTP_ADMIN_EMAIL,
} from "astro:env/server";

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export const sendEmailWithSMTP = async (data: FormData) => {
    const {
        firstname,
        surname,
        email,
        date,
    } = data;

    console.log("SMTP_HOST:", import.meta.env.SMTP_HOST);
    console.log("SMTP_PORT:", import.meta.env.SMTP_PORT);
    console.log("Environment check:", {
        host: import.meta.env.SMTP_HOST || "MISSING",
        port: import.meta.env.SMTP_PORT || "MISSING",
        user: import.meta.env.SMTP_USER || "MISSING",
    });

    const info = await transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: SMTP_ADMIN_EMAIL,
        replyTo: email,
        subject: `New Booking: ${data.date} (x${data.guests})`,
        text: `New Booking from ${firstname} ${surname} for ${date}. Contact: ${email}`,
        html: generateEmailHTML(data),
    });

    console.log("Message sent: %s", info.messageId);
    return info;
};
