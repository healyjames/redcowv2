import nodemailer from "nodemailer";
import {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
} from "astro:env/server";

export const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});
