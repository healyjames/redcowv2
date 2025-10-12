import FormData from "@/libs/types/constants";

export function generateEmailHTML(data: FormData): string {
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
          body, table, td, p { margin: 0; padding: 0; }
          img { border: 0; display: block; }
          table { border-collapse: collapse; }
          * { -webkit-text-size-adjust: none; -ms-text-size-adjust: none; }

          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content { padding: 15px !important; }
          }
        </style>
      </head>

      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f8fafc">
          <tr>
            <td align="center">
              <table class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="max-width:600px; background-color: #ffffff;">
                <tr>
                  <td align="center" bgcolor="#cbd5e1" style="padding: 20px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">New Booking Request</h1>
                  </td>
                </tr>
                <tr>
                  <td class="content" style="padding: 20px;">
                    <p><strong>Name:</strong> ${data.firstname} ${
        data.surname
    }</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Contact Number:</strong> ${data.number}</p>
                    <p><strong>Date:</strong> ${data.date}</p>
                    <p><strong>Number of Nights:</strong> ${data.nights}</p>
                    <p><strong>Number of Guests:</strong> ${data.guests}</p>
                    <p><strong>Room Preference:</strong> ${
                        data.room || "Any"
                    }</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 15px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    <p>This message was sent automatically from your booking system.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
