import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ToxiScoreMeter from "@/components/ToxiScoreMeter";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  toxiscore: number;
  color_code: "green" | "yellow" | "red";
  flagged_ingredients: Array<{
    name: string;
    reason: string;
    hazard_score: number;
  }>;
  summary: string;
  ingredients_raw?: string;
  alternatives?: Array<{
    name: string;
    brand: string;
    score: number;
  }>;
}

const getDemoProduct = (demoId: string): Product | null => {
  const demoProducts: Record<string, Product> = {
    'demo-shampoo': {
      id: 'demo-shampoo',
      name: 'Herbal Essence Shampoo',
      brand: 'Herbal Naturals',
      category: 'personal_care',
      toxiscore: 72,
      color_code: 'yellow',
      flagged_ingredients: [
        {
          name: 'Sodium Laureth Sulfate',
          reason: 'Can cause skin irritation and strip natural oils',
          hazard_score: 3
        },
        {
          name: 'Methylisothiazolinone',
          reason: 'Known allergen and skin sensitizer',
          hazard_score: 4
        },
        {
          name: 'Fragrance',
          reason: 'May contain undisclosed allergens',
          hazard_score: 2
        }
      ],
      summary: 'This shampoo has a ToxiScore of 72/100, placing it in the moderate safety zone. While it contains beneficial ingredients like Panthenol (Vitamin B5), it also includes Sodium Laureth Sulfate which can be harsh on sensitive scalps, and Methylisothiazolinone, a preservative linked to allergic reactions.',
      alternatives: [
        { name: 'Pure Coconut Shampoo', brand: 'Natural Care', score: 89 },
        { name: 'Gentle Cleansing Shampoo', brand: 'Eco Essentials', score: 92 },
        { name: 'Aloe Vera Hair Wash', brand: 'Green Beauty', score: 85 }
      ]
    },
    'demo-snack': {
      id: 'demo-snack',
      name: 'Classic Potato Chips',
      brand: 'Crispy Bites',
      category: 'food',
      toxiscore: 45,
      color_code: 'red',
      flagged_ingredients: [
        {
          name: 'Monosodium Glutamate',
          reason: 'May cause headaches and allergic reactions in sensitive individuals',
          hazard_score: 4
        },
        {
          name: 'Yellow 5',
          reason: 'Artificial colorant linked to hyperactivity in children',
          hazard_score: 4
        },
        {
          name: 'Yellow 6',
          reason: 'Synthetic dye that may cause allergic reactions',
          hazard_score: 4
        },
        {
          name: 'Disodium Inosinate',
          reason: 'Flavor enhancer that may trigger sensitivity',
          hazard_score: 3
        },
        {
          name: 'Disodium Guanylate',
          reason: 'May cause adverse reactions in people with gout',
          hazard_score: 3
        }
      ],
      summary: 'This snack has a ToxiScore of 45/100, indicating significant health concerns. It contains MSG (Monosodium Glutamate) which can trigger headaches and allergic reactions, along with artificial colorants Yellow 5 and Yellow 6 that have been linked to hyperactivity in children. The combination of multiple flavor enhancers and synthetic additives makes this a less healthy choice for regular consumption.',
      alternatives: [
        { name: 'Baked Potato Crisps', brand: 'Healthy Crunch', score: 78 },
        { name: 'Sea Salt Veggie Chips', brand: 'Pure Snacks', score: 82 },
        { name: 'Organic Corn Chips', brand: 'Nature Valley', score: 86 },
        { name: 'Multigrain Crackers', brand: 'Whole Foods', score: 80 }
      ]
    },
    'demo-lotion': {
      id: 'demo-lotion',
      name: 'Natural Body Lotion',
      brand: 'Pure Botanicals',
      category: 'cosmetic',
      toxiscore: 88,
      color_code: 'green',
      flagged_ingredients: [
        {
          name: 'Potassium Sorbate',
          reason: 'Mild preservative, generally safe but may cause minimal skin irritation in rare cases',
          hazard_score: 1
        }
      ],
      summary: 'This body lotion has an excellent ToxiScore of 88/100, indicating it is a safe and healthy choice. Made primarily with organic and natural ingredients like Aloe Vera, Shea Butter, and nourishing oils, it moisturizes without harsh chemicals. The only flagged ingredient is Potassium Sorbate, a mild and commonly used preservative that is generally recognized as safe.',
      alternatives: [
        { name: 'Ultra Pure Moisturizer', brand: 'Clean Beauty', score: 95 },
        { name: 'Organic Body Butter', brand: 'Earth Care', score: 93 },
        { name: 'Nourishing Hand Cream', brand: 'Green Botanics', score: 90 }
      ]
    }
  };

  return demoProducts[demoId] || null;
};

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      // Handle demo products with hardcoded data
      if (id?.startsWith('demo-')) {
        const demoData = getDemoProduct(id);
        if (demoData) {
          setProduct(demoData);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setProduct(null);
        setLoading(false);
        return;
      }
      
      // Transform the data to match our Product interface
      const productData: Product = {
        id: data.id,
        name: data.name,
        brand: data.brand || "",
        category: data.category || "",
        toxiscore: Number(data.toxiscore) || 0,
        color_code: (data.color_code as "green" | "yellow" | "red") || "yellow",
        flagged_ingredients: (data.flagged_ingredients as any) || [],
        summary: data.summary || "",
        ingredients_raw: data.ingredients_raw || "",
        alternatives: (data.alternatives as any) || []
      };
      
      setProduct(productData);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: `${product.name} - ToxiScore ${product.toxiscore}`,
      text: `Check out this product analysis on Purelytics! ToxiScore: ${product.toxiscore}/100`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button onClick={() => navigate("/")}>Back to Scan</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 relative p-4 flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-lg shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/scan")}
          className="hover:bg-primary/10 transition-all z-10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Scan Again
        </Button>
        <button 
          onClick={() => navigate("/")}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 cursor-pointer"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg hover:shadow-primary/50 hover:scale-110 transition-all duration-300">
            <span className="text-sm font-black text-primary-foreground tracking-wider">PLY</span>
          </div>
        </button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="hover:bg-primary/10 transition-all z-10"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6 animate-fade-in">
        {id?.startsWith('demo-') && (
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/40 rounded-xl p-4 text-center">
            <p className="font-bold text-foreground">
              Demo Product - This is a sample analysis to showcase Purelytics capabilities
            </p>
          </div>
        )}
        
        <Card className="p-8 space-y-8 bg-card/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{product.name}</h1>
            {product.brand && (
              <p className="text-lg text-muted-foreground font-medium">{product.brand}</p>
            )}
            {product.category && (
              <Badge variant="secondary" className="text-sm px-4 py-1">{product.category}</Badge>
            )}
          </div>

          <ToxiScoreMeter score={product.toxiscore} colorCode={product.color_code} />

          {product.ingredients_raw?.startsWith("[Typical formulation]") && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-accent/10 rounded-lg p-3 border border-accent/20">
              <span className="font-medium">Ingredients based on typical product formulation</span>
            </div>
          )}

          <div className="text-center bg-secondary/20 rounded-xl p-6">
            <p className="text-base text-foreground/90 leading-relaxed">{product.summary}</p>
          </div>
        </Card>

        {product.flagged_ingredients && product.flagged_ingredients.length > 0 && (
          <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Flagged Ingredients</h2>
                <p className="text-sm text-muted-foreground">Ingredients that require attention</p>
              </div>
            </div>

            <div className="space-y-4">
              {product.flagged_ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="p-5 bg-gradient-to-br from-secondary/50 to-secondary/20 hover:from-secondary/60 hover:to-secondary/30 rounded-xl space-y-2 border border-border/50 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-lg">{ingredient.name}</p>
                    <Badge
                      variant={
                        ingredient.hazard_score >= 4
                          ? "destructive"
                          : ingredient.hazard_score >= 3
                          ? "default"
                          : "secondary"
                      }
                      className="text-sm px-3 py-1"
                    >
                      Risk: {ingredient.hazard_score}/5
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ingredient.reason}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {product.alternatives && product.alternatives.length > 0 && (
          <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Safer Alternatives</h2>
                <p className="text-sm text-muted-foreground">Healthier products you can try</p>
              </div>
            </div>

            <div className="space-y-4">
              {product.alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="p-5 bg-gradient-to-br from-secondary/30 to-secondary/10 hover:from-secondary/40 hover:to-secondary/20 rounded-xl flex items-center justify-between border border-border/50 transition-all hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-lg">{alt.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{alt.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-success">
                      {alt.score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button 
          size="lg" 
          className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105" 
          onClick={() => navigate("/")}
        >
          Scan Another Product
        </Button>
      </main>
    </div>
  );
};

export default Result;
