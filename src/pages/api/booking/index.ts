import type { APIRoute } from "astro";
import type { FormData } from "@/libs/types/constants";
import { generateEmailHTML } from "@/libs/email/generateEmailHtml";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

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
        }),
    };
    
    await sendEmailWithResend(transformedData);

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

async function sendEmailWithResend(data: FormData) {
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          from: "noreply@redcownantwich.co.uk",
          to: data.email, // TODO: Change to redcow info email
          subject: `New Booking Request - ${data.firstname} ${data.surname}`,
          html: generateEmailHTML(data),
      }),
  });

  if (!response.ok) {
    throw new Error("Failed to send email");
  }
}