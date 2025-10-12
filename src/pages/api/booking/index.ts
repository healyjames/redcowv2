import type { APIRoute } from "astro";

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
          from: "noreply@redcownantwich.co.uk",
          to: data.email, // TDO: Change to redcow info email
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
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
        <title>New Booking Request</title>
        <style type="text/css">
          /* Client resets */
          body, table, td, p { margin: 0; padding: 0; }
          img { border: 0; display: block; }
          table { border-collapse: collapse; }
          * { -webkit-text-size-adjust: none; -ms-text-size-adjust: none; }

          /* Responsive fix for small screens */
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
            }
            .content {
              padding: 15px !important;
            }
          }
        </style>
      </head>

      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <!-- Full width background wrapper -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f8fafc">
          <tr>
            <td align="center">
              <!-- Main container (600px fixed width) -->
              <table class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="max-width:600px; background-color: #ffffff;">
                <!-- Header -->
                <tr>
                  <td align="center" bgcolor="#cbd5e1" style="padding: 20px; color: #1e293b; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">New Booking Request</h1>
                  </td>
                </tr>

                <!-- Body content -->
                <tr>
                  <td class="content" bgcolor="#ffffff" style="padding: 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="font-weight: bold; color: #555;">Name:</span>
                          <span style="color: #1e293b;">${data.firstname} ${
            data.surname
        }</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="font-weight: bold; color: #555;">Email:</span>
                          <span style="color: #1e293b;">${data.email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="font-weight: bold; color: #555;">Contact Number:</span>
                          <span style="color: #1e293b;">${data.number}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="font-weight: bold; color: #555;">Date:</span>
                          <span style="color: #1e293b;">${data.date}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="font-weight: bold; color: #555;">Number of Nights:</span>
                          <span style="color: #1e293b;">${data.nights}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="font-weight: bold; color: #555;">Number of Guests:</span>
                          <span style="color: #1e293b;">${data.guests}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <span style="font-weight: bold; color: #555;">Room Preference:</span>
                          <span style="color: #1e293b;">${data.room || "Any"}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td bgcolor="#ffffff" align="center" style="padding: 15px; font-size: 12px; color: #64748b; border-top-style: solid; border-top-color: #e2e8f0; border-top-width: 1px; border-bottom-left-radius: 15px;">
                    <p style="margin: 0;">This message was sent automatically from your booking system.</p>
                  </td>
                </tr>
              </table>
              <!-- End main container -->
            </td>
          </tr>
        </table>
      </body>
    </html>

  `;
}
