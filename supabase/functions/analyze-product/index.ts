import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Define strict validation schemas for AI responses
const ProductExtractionSchema = z.object({
  productName: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100).default("Unknown"),
  category: z.enum(["food", "cosmetic", "cleaning", "pharmaceutical", "beverage", "supplement", "personal_care"]),
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseKey || !lovableApiKey) {
      console.error("Missing environment variables");
      throw new Error("Server configuration error");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { image } = await req.json();
    
    if (!image) {
      throw new Error("No image provided");
    }

    console.log("Image received, validating authentication...");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("Unauthorized");
    }

    console.log(`Analyzing product for user: ${user.id}`);

    // Use Lovable AI to analyze the image
    console.log("Sending image to Lovable AI for analysis...");
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are an expert at reading product labels and ingredient lists. Analyze this product image carefully.

CRITICAL INSTRUCTIONS FOR INGREDIENT EXTRACTION:
1. Look for the ingredients list - it's usually on the back or side of the product
2. The ingredients section often starts with words like "Ingredients:", "Contains:", "Composition:", or similar
3. Extract EVERY SINGLE ingredient mentioned, no matter how small the text
4. If the image shows multiple sides/angles of the product, read from all visible areas
5. Common ingredient separators: commas, semicolons, bullet points, or line breaks
6. Be extremely thorough - even if there are 50+ ingredients, list them ALL

PRODUCT INFORMATION TO EXTRACT:
1. Product name (the main product title on the front label)
2. Brand name (manufacturer or brand - look for registered trademark symbols ® or ™)
3. Category (select the most appropriate): food, cosmetic, cleaning, pharmaceutical, beverage, supplement, personal_care
4. Complete ingredients list (MANDATORY - must have at least one ingredient)

ERROR HANDLING:
- If you cannot find ANY ingredients in this image, respond with: "NO_INGREDIENTS_VISIBLE"
- If the image is too blurry to read text, respond with: "IMAGE_TOO_BLURRY"
- If no product is visible, respond with: "NO_PRODUCT_DETECTED"

SUCCESS RESPONSE FORMAT (JSON only):
{
  "productName": "Complete Product Name from Front Label",
  "brand": "Brand/Manufacturer Name",
  "category": "personal_care",
  "ingredients": ["Water", "Glycerin", "Sodium Laureth Sulfate", "Fragrance", "Preservative", "etc"]
}

Return ONLY valid JSON or one of the error messages above.`,
                },
                {
                  type: "image_url",
                  image_url: { url: image },
                },
              ],
            },
          ],
          max_tokens: 2000,
        }),
      },
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("AI service is busy. Please try again in a moment.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI service requires payment. Please contact support.");
      }
      throw new Error(`AI analysis failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error("Invalid AI response structure:", JSON.stringify(aiData));
      throw new Error("Unable to analyze the image. Please ensure the product label is clearly visible and try again.");
    }

    const content = aiData.choices[0].message.content.trim();
    console.log("Parsing AI response...");
    
    // Check for specific error messages from AI
    if (content === "NO_INGREDIENTS_VISIBLE") {
      throw new Error("Could not find the ingredients list in this image. Please ensure you're photographing the back or side of the product where ingredients are typically listed.");
    }
    if (content === "IMAGE_TOO_BLURRY") {
      throw new Error("The image is too blurry to read. Please take a clearer, well-lit photo with the camera held steady.");
    }
    if (content === "NO_PRODUCT_DETECTED") {
      throw new Error("No product visible in the image. Please photograph the product label directly.");
    }
    
    // More flexible JSON extraction
    let jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/(\{[\s\S]*\})/);
    }
    
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", content);
      throw new Error("Unable to process the image. Please ensure the ingredients list is clearly visible and photographed directly.");
    }
    
    // Validate AI response with Zod schema
    let extractedData;
    try {
      const parsedData = JSON.parse(jsonMatch[1]);
      console.log("Parsed product data:", JSON.stringify(parsedData));
      
      // Check if ingredients array is empty before validation
      if (!parsedData.ingredients || parsedData.ingredients.length === 0) {
        console.error("AI returned empty ingredients array");
        throw new Error("Could not extract ingredients from the image. Please ensure:\n• The ingredients list is clearly visible\n• You're photographing the back/side panel where ingredients are listed\n• The image is well-lit and text is readable\n• The camera is focused on the ingredients section");
      }
      
      extractedData = ProductExtractionSchema.parse(parsedData);
      console.log(`Successfully extracted: ${extractedData.productName} with ${extractedData.ingredients.length} ingredients`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("AI product extraction validation failed:", error.errors);
        const ingredientError = error.errors.find(e => e.path.includes('ingredients'));
        if (ingredientError) {
          throw new Error("Could not extract ingredients. Please photograph the ingredients list clearly - it's usually on the back or side of the product.");
        }
        throw new Error("Could not validate product data. Please ensure all product information is clearly visible.");
      }
      console.error("JSON parsing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not read product information. Please try with a clearer photo.";
      throw new Error(errorMessage);
    }

    // Fetch ingredient toxicity data
    console.log("Fetching ingredient database...");
    const { data: ingredientData, error: dbError } = await supabase.from("ingredients").select("*");
    
    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to access ingredient database");
    }

    console.log(`Database has ${ingredientData?.length || 0} ingredients`);

    // Calculate toxicity score with improved algorithm
    const flaggedIngredients: any[] = [];
    let totalHazardScore = 0;
    let matchedCount = 0;

    console.log("Analyzing ingredients for toxicity...");
    for (const ingredient of extractedData.ingredients) {
      const ingredientLower = ingredient.toLowerCase().trim();
      const match = ingredientData?.find((db: any) => {
        const dbNameLower = db.name.toLowerCase();
        return ingredientLower.includes(dbNameLower) || 
               dbNameLower.includes(ingredientLower) ||
               ingredientLower === dbNameLower;
      });

      if (match) {
        matchedCount++;
        totalHazardScore += match.hazard_score;
        flaggedIngredients.push({
          name: match.name,
          reason: match.description,
          hazard_score: match.hazard_score,
        });
        console.log(`Flagged ingredient: ${match.name} (hazard: ${match.hazard_score})`);
      }
    }

    console.log(`Matched ${matchedCount} out of ${extractedData.ingredients.length} ingredients`);

    // Improved scoring logic
    let toxiscore: number;
    let colorCode: string;
    
    if (matchedCount === 0) {
      // If no ingredients matched our database, assume it's relatively safe but unknown
      toxiscore = 75; // Neutral score for unknown products
      colorCode = "yellow";
    } else {
      // Calculate based on actual hazard scores (1-5 scale)
      const avgHazardScore = totalHazardScore / matchedCount;
      
      // Convert hazard score to toxiscore: 
      // Hazard 1 = 95-100, Hazard 2 = 80-94, Hazard 3 = 60-79, Hazard 4 = 40-59, Hazard 5 = 0-39
      toxiscore = Math.round(100 - ((avgHazardScore - 1) * 21.25));
      toxiscore = Math.max(0, Math.min(100, toxiscore));
      
      // Also factor in the percentage of flagged ingredients
      const flaggedPercentage = (matchedCount / extractedData.ingredients.length) * 100;
      if (flaggedPercentage > 50) {
        toxiscore = Math.round(toxiscore * 0.85); // Reduce score if more than half are problematic
      }
      
      colorCode = toxiscore >= 70 ? "green" : toxiscore >= 40 ? "yellow" : "red";
    }
    
    console.log(`Score calculation: ${matchedCount}/${extractedData.ingredients.length} ingredients matched, avgHazard: ${matchedCount > 0 ? (totalHazardScore / matchedCount).toFixed(2) : 'N/A'}, final score: ${toxiscore}`);

    // Generate AI summary with detailed safety analysis
    console.log("Generating safety summary and alternatives...");
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
          content: `You are a health and safety expert. Analyze this product:

Product Name: ${extractedData.productName}
Brand: ${extractedData.brand}
Category: ${extractedData.category}
ToxiScore: ${toxiscore}/100 (${colorCode} zone)
Total Ingredients: ${extractedData.ingredients.length}
Flagged Ingredients: ${flaggedIngredients.length}

${flaggedIngredients.length > 0 ? `
Harmful Ingredients Found:
${flaggedIngredients.map((i) => `- ${i.name} (Hazard Level: ${i.hazard_score}/5) - ${i.reason}`).join('\n')}
` : 'No harmful ingredients detected in our database.'}

All Ingredients: ${extractedData.ingredients.join(", ")}

Task:
1. Write a clear 2-3 sentence safety summary that explains:
   - What the ToxiScore means for this product
   - The main health concerns (if any)
   - Whether this product is generally safe to use

2. Recommend 3-5 real alternative products from the same category that are safer
   - Use actual product names and brands
   - Provide realistic ToxiScore values (70-95 range for safer alternatives)
   - Ensure alternatives are readily available in the market

Return ONLY valid JSON in this format:
{
  "summary": "Your 2-3 sentence safety analysis here",
  "alternatives": [
    {"name": "Specific Product Name", "brand": "Real Brand Name", "score": 88},
    {"name": "Another Product Name", "brand": "Brand Name", "score": 92}
  ]
}`
        }],
        max_tokens: 1000,
      }),
    });

    if (!summaryResponse.ok) {
      console.error("Summary generation failed:", summaryResponse.status);
      // Provide fallback summary
      const fallbackSummary = {
        summary: toxiscore >= 70 
          ? `This product has a ToxiScore of ${toxiscore}/100, indicating it's relatively safe. ${flaggedIngredients.length > 0 ? 'Some ingredients require attention.' : 'No major concerns detected.'}`
          : `This product has a ToxiScore of ${toxiscore}/100. ${flaggedIngredients.length} concerning ingredients were identified that may pose health risks.`,
        alternatives: []
      };
      
      console.log("Using fallback summary");
      
      // Save to database with fallback
      const { data: product, error: insertError } = await supabase.from("products").insert({
        user_id: user.id,
        name: extractedData.productName,
        brand: extractedData.brand,
        category: extractedData.category,
        ingredients_raw: extractedData.ingredients.join(", "),
        toxiscore,
        color_code: colorCode,
        flagged_ingredients: flaggedIngredients,
        summary: fallbackSummary.summary,
        alternatives: [],
      }).select().single();

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw new Error("Failed to save product analysis");
      }

      console.log(`Product saved with ID: ${product.id}`);
      return new Response(JSON.stringify({ productId: product.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const summaryData = await summaryResponse.json();
    console.log("Summary generated");
    
    const summaryContent = summaryData.choices[0].message.content;
    const summaryMatch = summaryContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || summaryContent.match(/(\{[\s\S]*\})/);
    
    // Validate summary response with Zod schema
    let summaryJson;
    try {
      const parsedSummary = JSON.parse(summaryMatch ? summaryMatch[1] : summaryContent);
      summaryJson = SummarySchema.parse(parsedSummary);
      console.log("Summary validated successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("AI summary validation failed:", error.errors);
        // Use fallback
        summaryJson = {
          summary: `This product has a ToxiScore of ${toxiscore}/100. ${flaggedIngredients.length > 0 ? `${flaggedIngredients.length} ingredients require attention.` : 'No major concerns detected.'}`,
          alternatives: []
        };
      } else {
        console.error("Summary parsing error:", error);
        throw new Error("Could not generate product summary");
      }
    }

    // Save to database
    console.log("Saving product to database...");
    const { data: product, error: insertError } = await supabase.from("products").insert({
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

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save product analysis");
    }

    console.log(`✅ Analysis complete! Product ID: ${product.id}`);
    console.log(`Product: ${extractedData.productName} | Score: ${toxiscore}/100 | Flagged: ${flaggedIngredients.length} ingredients`);

    return new Response(JSON.stringify({ 
      productId: product.id,
      score: toxiscore,
      productName: extractedData.productName 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Error analyzing product:", error);
    console.error("Error stack:", error.stack);
    
    let errorMessage = error.message || "An unexpected error occurred";
    let statusCode = 500;

    // Handle specific error cases
    if (errorMessage.includes("Unauthorized") || errorMessage.includes("authentication")) {
      statusCode = 401;
      errorMessage = "Please sign in to scan products";
    } else if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
      statusCode = 429;
      errorMessage = "Too many requests. Please try again in a moment.";
    } else if (errorMessage.includes("Payment") || errorMessage.includes("402")) {
      statusCode = 402;
      errorMessage = "Service temporarily unavailable. Please contact support.";
    } else if (errorMessage.includes("image") || errorMessage.includes("photo")) {
      statusCode = 400;
      errorMessage = "Could not read the product image. Please try with a clearer photo showing the ingredients list.";
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: Deno.env.get("ENVIRONMENT") === "development" ? error.stack : undefined 
    }), {
      status: statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
