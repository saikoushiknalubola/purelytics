import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Define strict validation schemas for AI responses
const ProductExtractionSchema = z.object({
  productName: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100).default("Unknown"),
  category: z.enum(["food", "cosmetic", "cleaning", "pharmaceutical"]),
  ingredients: z.array(z.string().trim().min(1).max(100)).min(1).max(500),
});

const SummarySchema = z.object({
  summary: z.string().trim().max(1000),
  alternatives: z.array(
    z.object({
      name: z.string().trim().max(200),
      brand: z.string().trim().max(100),
      score: z.number().int().min(0).max(100),
    })
  ).max(10).default([]),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { image } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    console.log("Analyzing product image with AI...");

    // Use Lovable AI to analyze the image
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this product image. Extract:
1. Product name and brand
2. Category (food/cosmetic/cleaning/pharmaceutical)
3. All ingredients from the label

Return ONLY a JSON object:
{
  "productName": "string",
  "brand": "string",
  "category": "string",
  "ingredients": ["ingredient1", "ingredient2"]
}`,
                },
                {
                  type: "image_url",
                  image_url: { url: image },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
    
    // Validate AI response with Zod schema
    let extractedData;
    try {
      const parsedData = JSON.parse(jsonMatch ? jsonMatch[1] : content);
      extractedData = ProductExtractionSchema.parse(parsedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("AI product extraction validation failed:", error.errors);
        throw new Error("AI returned invalid product data. Please try again with a clearer image.");
      }
      throw error;
    }

    // Fetch ingredient toxicity data
    const { data: ingredientData } = await supabase.from("ingredients").select("*");

    // Calculate toxicity score
    const flaggedIngredients: any[] = [];
    let totalHazardScore = 0;
    let matchedCount = 0;

    for (const ingredient of extractedData.ingredients) {
      const ingredientLower = ingredient.toLowerCase().trim();
      const match = ingredientData?.find((db: any) =>
        ingredientLower.includes(db.name.toLowerCase()) || db.name.toLowerCase().includes(ingredientLower)
      );

      if (match) {
        matchedCount++;
        totalHazardScore += match.hazard_score;
        flaggedIngredients.push({
          name: match.name,
          reason: match.description,
          hazard_score: match.hazard_score,
        });
      }
    }

    const avgHazardScore = matchedCount > 0 ? totalHazardScore / matchedCount : 1;
    const toxiscore = Math.max(0, Math.min(100, 100 - (avgHazardScore * 20)));
    const colorCode = toxiscore >= 70 ? "green" : toxiscore >= 40 ? "yellow" : "red";

    // Generate AI summary
    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `Product: ${extractedData.productName}
ToxiScore: ${toxiscore}/100
Flagged: ${flaggedIngredients.map((i) => i.name).join(", ") || "None"}

Return JSON:
{"summary": "brief safety summary", "alternatives": [{"name": "product", "brand": "brand", "score": 85}]}`
        }],
      }),
    });

    const summaryData = await summaryResponse.json();
    const summaryContent = summaryData.choices[0].message.content;
    const summaryMatch = summaryContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || summaryContent.match(/(\{[\s\S]*\})/);
    
    // Validate summary response with Zod schema
    let summaryJson;
    try {
      const parsedSummary = JSON.parse(summaryMatch ? summaryMatch[1] : summaryContent);
      summaryJson = SummarySchema.parse(parsedSummary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("AI summary validation failed:", error.errors);
        throw new Error("AI returned invalid summary data. Please try again.");
      }
      throw error;
    }

    // Save to database
    const { data: product } = await supabase.from("products").insert({
      user_id: user.id,
      name: extractedData.productName,
      brand: extractedData.brand,
      category: extractedData.category,
      ingredients_raw: extractedData.ingredients.join(", "),
      toxiscore,
      color_code: colorCode,
      flagged_ingredients: flaggedIngredients,
      summary: summaryJson.summary,
      alternatives: summaryJson.alternatives,
    }).select().single();

    return new Response(JSON.stringify({ productId: product.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error analyzing product:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
