import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Define strict validation schemas for AI responses
const ProductExtractionSchema = z.object({
  productName: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(100).default("Unknown"),
  category: z.enum(["food", "cosmetic", "cleaning", "pharmaceutical", "beverage", "supplement", "personal_care"]),
  ingredients: z.array(z.string().trim().min(1).max(100)).min(1).max(500),
  ingredientSource: z.enum(["image", "knowledge"]),
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
    
    // Validate image presence and type
    if (!image || typeof image !== 'string') {
      throw new Error("Invalid image data");
    }

    // Validate MIME type and format
    const mimeMatch = image.match(/^data:image\/(jpeg|jpg|png|webp);base64,/);
    if (!mimeMatch) {
      throw new Error("Only JPEG, PNG, and WebP formats are supported");
    }

    // Validate size (5MB image = ~7MB base64)
    if (image.length > 7000000) {
      throw new Error("Image too large. Maximum size is 5MB");
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

    // Rate limiting: Check scans in last hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: recentScans } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (recentScans && recentScans >= 10) {
      console.log(`Rate limit exceeded for user ${user.id}`);
      throw new Error("Rate limit exceeded. You can scan up to 10 products per hour. Please try again later.");
    }

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
          text: `You are an expert product analyst with comprehensive knowledge of product formulations. Analyze this image using a TWO-STEP process:

STEP 1 - Try to extract ingredients from the image:
• Look carefully for the ingredients list (typically on back, side, or bottom)
• Ingredients sections start with: "Ingredients:", "Contains:", "Composition:", "INCI:", "Formula:"
• Extract ALL visible ingredients, even if text is small, blurry, or partially visible
• Use context clues and chemical knowledge to decipher unclear text

STEP 2 - If NO ingredients are visible in the image, use your KNOWLEDGE:
• Identify the product name, brand, and category from what IS visible
• Research and provide the TYPICAL/STANDARD ingredients for this specific product
• Use your knowledge of common formulations for this product type
• Provide the most accurate ingredient list based on typical formulations

WHAT TO EXTRACT:
1. Product name: The main product title
2. Brand: The manufacturer/brand name
3. Category: Choose ONE: food, cosmetic, cleaning, pharmaceutical, beverage, supplement, personal_care
4. Ingredients: Either from the IMAGE or from your KNOWLEDGE
5. ingredientSource: Set to "image" if extracted from photo, "knowledge" if researched

CRITICAL RULES:
• ALWAYS return ingredients - either from image OR from knowledge
• NEVER return an empty ingredients array
• If you can identify the product, you can provide typical ingredients
• Be transparent about the source in ingredientSource field

Return ONLY valid JSON in this exact format:
{
  "productName": "Product Name Here",
  "brand": "Brand Name Here", 
  "category": "personal_care",
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
  "ingredientSource": "image"
}`,
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
    console.log("AI returned:", content.substring(0, 200) + "...");
    
    // Extract JSON from response
    let jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (!jsonMatch) {
      jsonMatch = content.match(/(\{[\s\S]*\})/);
    }
    
    if (!jsonMatch) {
      console.error("Could not parse AI response - no JSON found");
      throw new Error("Unable to analyze the image. Please try:\n• Ensuring good lighting\n• Focusing on the ingredients panel\n• Taking the photo from directly above\n• Making sure text is clear and readable");
    }
    
    // Validate AI response with Zod schema
    let extractedData;
    try {
      const parsedData = JSON.parse(jsonMatch[1]);
      console.log("Parsed product data:", JSON.stringify(parsedData));
      
      extractedData = ProductExtractionSchema.parse(parsedData);
      console.log(`Successfully extracted: ${extractedData.productName} with ${extractedData.ingredients.length} ingredients from ${extractedData.ingredientSource}`);
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

    // Calculate toxicity score with IMPROVED FUZZY MATCHING algorithm
    const flaggedIngredients: any[] = [];
    let totalHazardScore = 0;
    let matchedCount = 0;

    console.log("Analyzing ingredients for toxicity...");
    
    // Helper function for fuzzy ingredient matching
    const fuzzyMatch = (ingredient: string, dbName: string): boolean => {
      const ingLower = ingredient.toLowerCase().trim();
      const dbLower = dbName.toLowerCase().trim();
      
      // Exact match
      if (ingLower === dbLower) return true;
      
      // Contains match (bidirectional)
      if (ingLower.includes(dbLower) || dbLower.includes(ingLower)) return true;
      
      // Word boundary match for chemical families
      // e.g., "methylparaben" contains "paraben"
      const ingWords = ingLower.split(/[\s,-]+/);
      const dbWords = dbLower.split(/[\s,-]+/);
      
      // Check if any word from db name appears in ingredient
      for (const dbWord of dbWords) {
        if (dbWord.length > 3) { // Ignore short words like "and", "or"
          for (const ingWord of ingWords) {
            if (ingWord.includes(dbWord) || dbWord.includes(ingWord)) {
              return true;
            }
          }
        }
      }
      
      return false;
    };
    
    for (const ingredient of extractedData.ingredients) {
      const match = ingredientData?.find((db: any) => fuzzyMatch(ingredient, db.name));

      if (match) {
        matchedCount++;
        totalHazardScore += match.hazard_score;
        flaggedIngredients.push({
          name: match.name,
          reason: match.description,
          hazard_score: match.hazard_score,
        });
        console.log(`✓ Flagged: ${ingredient} → ${match.name} (hazard: ${match.hazard_score})`);
      }
    }

    console.log(`Matched ${matchedCount} out of ${extractedData.ingredients.length} ingredients`);

    // ENHANCED scoring logic with dynamic calculation
    let toxiscore: number;
    let colorCode: string;
    
    if (matchedCount === 0) {
      // If no ingredients matched our database, assume relatively safe but give neutral score
      toxiscore = 80; // Slightly optimistic for unknown products
      colorCode = "green";
      console.log("No harmful ingredients detected in database - assigning neutral safe score");
    } else {
      // Calculate based on actual hazard scores (1-5 scale)
      const avgHazardScore = totalHazardScore / matchedCount;
      
      // Enhanced conversion: Hazard 1=95, Hazard 2=85, Hazard 3=65, Hazard 4=45, Hazard 5=20
      // More aggressive penalty for higher hazard scores
      const baseScore = Math.round(100 - (avgHazardScore - 1) * 20);
      
      // Factor in the percentage of flagged ingredients (more weight)
      const flaggedPercentage = (matchedCount / extractedData.ingredients.length) * 100;
      let penaltyMultiplier = 1.0;
      
      if (flaggedPercentage > 70) {
        penaltyMultiplier = 0.70; // Heavy penalty: >70% flagged
      } else if (flaggedPercentage > 50) {
        penaltyMultiplier = 0.80; // Moderate penalty: >50% flagged
      } else if (flaggedPercentage > 30) {
        penaltyMultiplier = 0.90; // Light penalty: >30% flagged
      }
      
      // Apply penalty and consider total number of flagged ingredients
      toxiscore = Math.round(baseScore * penaltyMultiplier);
      
      // Extra penalty if there are multiple high-hazard ingredients
      const highHazardCount = flaggedIngredients.filter(i => i.hazard_score >= 4).length;
      if (highHazardCount >= 3) {
        toxiscore = Math.round(toxiscore * 0.85);
      }
      
      // Clamp between 0-100
      toxiscore = Math.max(0, Math.min(100, toxiscore));
      
      // Dynamic color coding
      colorCode = toxiscore >= 70 ? "green" : toxiscore >= 40 ? "yellow" : "red";
    }
    
    console.log(`📊 Score: ${toxiscore}/100 | Matched: ${matchedCount}/${extractedData.ingredients.length} | Avg Hazard: ${matchedCount > 0 ? (totalHazardScore / matchedCount).toFixed(2) : 'N/A'} | Color: ${colorCode}`);

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
Ingredient Source: ${extractedData.ingredientSource === "knowledge" ? "Typical formulation (ingredients from product knowledge)" : "Extracted from image"}
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
   ${extractedData.ingredientSource === "knowledge" ? "   - IMPORTANT: Start with 'Based on typical formulation for this product...' to indicate ingredients are researched\n" : ""}

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
      ingredients_raw: `${extractedData.ingredientSource === "knowledge" ? "[Typical formulation] " : ""}${extractedData.ingredients.join(", ")}`,
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

    // Send email notification for high-risk products (ToxiScore below 70)
    if (toxiscore < 70 && user.email) {
      try {
        console.log(`Sending risk alert email for high-risk product (ToxiScore: ${toxiscore})`);
        const alertResponse = await fetch(`${supabaseUrl}/functions/v1/send-risk-alert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email: user.email,
            productName: extractedData.productName,
            brand: extractedData.brand,
            toxiscore,
            flaggedIngredients,
            summary: summaryJson.summary,
          }),
        });

        if (alertResponse.ok) {
          console.log("Risk alert email sent successfully");
        } else {
          console.error("Failed to send risk alert email:", await alertResponse.text());
        }
      } catch (emailError) {
        console.error("Error sending risk alert email:", emailError);
        // Don't throw - email failure shouldn't fail the whole scan
      }
    }

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
