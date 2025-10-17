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
  alternatives?: Array<{
    name: string;
    brand: string;
    score: number;
  }>;
}

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
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
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
      <header className="sticky top-0 z-50 p-4 flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-lg shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/scan")}
          className="hover:bg-primary/10 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Scan Again
        </Button>
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <span className="text-base font-bold text-primary-foreground tracking-tight">PL</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="hover:bg-primary/10 transition-all"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6 animate-fade-in">
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
