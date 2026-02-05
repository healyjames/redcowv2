import type { FormData } from "@/libs/types/constants";

export function customerConfirmationHtml(data: FormData) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Booking Request Received</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
              <tr>
                  <td style="padding: 40px 20px;">
                      <!-- Main Container -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          
                          <!-- Header with Logo -->
                          <tr>
                              <td style="padding: 40px 40px 30px 40px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
                                  <img src="${ data.logo }" width="150" style="display: block; margin: 0 auto; max-width: 150px; height: auto;">
                              </td>
                          </tr>
                          
                          <!-- Title -->
                          <tr>
                              <td style="padding: 0 40px 30px 40px; text-align: center;">
                                  <h1 style="margin: 0; color: #333333; font-size: 28px; font-weight: bold; line-height: 1.3;">Booking Request Received</h1>
                              </td>
                          </tr>
                          
                          <!-- Body Content -->
                          <tr>
                              <td style="padding: 0 40px 20px 40px;">
                                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: normal;">Thanks for your room booking request, ${data.firstname}!</h2>
                                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 18px; line-height: 1.6;">We've received your booking request with the following details:</p>
                                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">Note: your booking is not yet confirmed. We will be in touch shortly to confirm.</p>
                              </td>
                          </tr>
                          
                          <!-- Booking Details -->
                          <tr>
                              <td style="padding: 0 40px 30px 40px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 6px;">
                                      <tr>
                                          <td style="padding: 20px;">
                                              <table role="presentation" cellspacing="0" cellpadding="8" border="0" width="100%">
                                                  <tr>
                                                      <td style="color: #333333; font-size: 15px; padding: 8px 0;"><strong>Name:</strong></td>
                                                      <td style="color: #666666; font-size: 15px; padding: 8px 0; text-align: right;">${data.firstname} ${data.surname}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="color: #333333; font-size: 15px; padding: 8px 0;"><strong>Room:</strong></td>
                                                      <td style="color: #666666; font-size: 15px; padding: 8px 0; text-align: right;">${data.room}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="color: #333333; font-size: 15px; padding: 8px 0;"><strong>Check-in Date:</strong></td>
                                                      <td style="color: #666666; font-size: 15px; padding: 8px 0; text-align: right;">${data.date}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="color: #333333; font-size: 15px; padding: 8px 0;"><strong>Number of Nights:</strong></td>
                                                      <td style="color: #666666; font-size: 15px; padding: 8px 0; text-align: right;">${data.nights}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="color: #333333; font-size: 15px; padding: 8px 0;"><strong>Number of Guests:</strong></td>
                                                      <td style="color: #666666; font-size: 15px; padding: 8px 0; text-align: right;">${data.guests}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="color: #333333; font-size: 15px; padding: 8px 0;"><strong>Contact Number:</strong></td>
                                                      <td style="color: #666666; font-size: 15px; padding: 8px 0; text-align: right;">${data.number}</td>
                                                  </tr>
                                                  <tr>
                                                      <td style="color: #333333; font-size: 15px; padding: 8px 0;"><strong>Email:</strong></td>
                                                      <td style="color: #666666; font-size: 15px; padding: 8px 0; text-align: right;">${data.email}</td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          
                          <!-- Additional Text (if provided) -->
                          <tr>
                              <td style="padding: 0 40px 20px 40px;">
                                  <!-- Only show this section if additionaltext has content -->
                                  ${
                                      data.additionaltext
                                          ? `
                                  <div style="margin-bottom: 20px;">
                                      <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px;"><strong>Additional Information:</strong></p>
                                      <p style="margin: 0; color: #666666; font-size: 15px; line-height: 1.6; background-color: #f9f9f9; padding: 15px; border-radius: 6px;">${data.additionaltext}</p>
                                  </div>
                                  `
                                          : ""
                                  }
                              </td>
                          </tr>
                          
                          <!-- Confirmation Message -->
                          <tr>
                              <td style="padding: 0 40px 40px 40px;">
                                  <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.6;">This is a confirmation of receipt — we will be in touch to confirm your booking.</p>
                              </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                              <td style="padding: 30px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
                                  <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                      If you have any questions, please don't hesitate to contact us.
                                  </p>
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
