import type { APIRoute } from "astro";

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
    
    await sendEmailWithResend(data);

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

async function sendEmailWithResend(data: any) {
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "bookings@yourdomain.com",
      to: "your-email@example.com",
      subject: `New Booking Request - ${data.firstname} ${data.surname}`,
      html: generateEmailHTML(data),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send email");
  }
}

// Generate email HTML
function generateEmailHTML(data: any): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8B0000; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Request</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span>
              <span class="value">${data.firstname} ${data.surname}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value">${data.email}</span>
            </div>
            <div class="field">
              <span class="label">Contact Number:</span>
              <span class="value">${data.number}</span>
            </div>
            <div class="field">
              <span class="label">Date:</span>
              <span class="value">${data.date}</span>
            </div>
            <div class="field">
              <span class="label">Number of Nights:</span>
              <span class="value">${data.nights}</span>
            </div>
            <div class="field">
              <span class="label">Number of Guests:</span>
              <span class="value">${data.guests}</span>
            </div>
            <div class="field">
              <span class="label">Room Preference:</span>
              <span class="value">${data.room || "Any"}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
