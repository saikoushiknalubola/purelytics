import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RiskAlertRequest {
  email: string;
  productName: string;
  brand: string;
  toxiscore: number;
  flaggedIngredients: Array<{
    name: string;
    reason: string;
    hazard_score: number;
  }>;
  summary: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      productName,
      brand,
      toxiscore,
      flaggedIngredients,
      summary,
    }: RiskAlertRequest = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log(`Sending risk alert to ${email} for product: ${productName}`);

    // Generate ingredient list HTML
    const ingredientListHtml = flaggedIngredients
      .map(
        (ing) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${ing.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">
            <span style="background: ${
              ing.hazard_score >= 4 ? "#ef4444" : ing.hazard_score >= 3 ? "#f97316" : "#eab308"
            }; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${
          ing.hazard_score
        }/5</span>
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 13px; color: #666;">${
            ing.reason
          }</td>
        </tr>
      `
      )
      .join("");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Purelytics <onboarding@resend.dev>",
        to: [email],
        subject: `High-Risk Product Alert: ${productName}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0 0 8px 0; font-size: 24px;">High-Risk Product Alert</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Your recent scan detected potential health concerns</p>
            </div>
            
            <!-- Content -->
            <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              <!-- Product Info -->
              <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="background: #dc2626; color: white; width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">
                    ${toxiscore}
                  </div>
                  <div>
                    <h2 style="margin: 0 0 4px 0; font-size: 18px; color: #1f2937;">${productName}</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">${brand}</p>
                  </div>
                </div>
              </div>
              
              <!-- ToxiScore Explanation -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">What this means</h3>
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">${summary}</p>
              </div>
              
              <!-- Flagged Ingredients -->
              ${
                flaggedIngredients.length > 0
                  ? `
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">Concerning Ingredients</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <thead>
                    <tr style="background: #f9fafb;">
                      <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Ingredient</th>
                      <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Hazard</th>
                      <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Concern</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ingredientListHtml}
                  </tbody>
                </table>
              </div>
              `
                  : ""
              }
              
              <!-- Recommendations -->
              <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #166534;">Recommendations</h3>
                <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                  <li>Consider switching to a safer alternative</li>
                  <li>Check our app for product recommendations</li>
                  <li>Consult with a healthcare professional if concerned</li>
                </ul>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app")}" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Find Safer Alternatives
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">This alert was sent by Purelytics</p>
              <p style="margin: 0;">You're receiving this because you scanned a high-risk product.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const responseData = await emailResponse.json();
    console.log("Risk alert email sent successfully:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-risk-alert function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
