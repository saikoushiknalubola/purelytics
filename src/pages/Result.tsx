import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ToxiScoreMeter from "@/components/ToxiScoreMeter";
import logo from "@/assets/logo.jpeg";

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
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <img src={logo} alt="Purelytics" className="h-8" />
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <Card className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {product.brand && (
              <p className="text-muted-foreground">{product.brand}</p>
            )}
            {product.category && (
              <Badge variant="secondary">{product.category}</Badge>
            )}
          </div>

          <ToxiScoreMeter score={product.toxiscore} colorCode={product.color_code} />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">{product.summary}</p>
          </div>
        </Card>

        {product.flagged_ingredients && product.flagged_ingredients.length > 0 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold">Flagged Ingredients</h2>
            </div>

            <div className="space-y-3">
              {product.flagged_ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="p-4 bg-secondary/50 rounded-lg space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{ingredient.name}</p>
                    <Badge
                      variant={
                        ingredient.hazard_score >= 4
                          ? "destructive"
                          : ingredient.hazard_score >= 3
                          ? "default"
                          : "secondary"
                      }
                    >
                      Risk: {ingredient.hazard_score}/5
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ingredient.reason}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {product.alternatives && product.alternatives.length > 0 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h2 className="text-lg font-semibold">Safer Alternatives</h2>
            </div>

            <div className="space-y-3">
              {product.alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="p-4 bg-secondary/30 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{alt.name}</p>
                    <p className="text-sm text-muted-foreground">{alt.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-success">
                      {alt.score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button size="lg" className="w-full" onClick={() => navigate("/")}>
          Scan Another Product
        </Button>
      </main>
    </div>
  );
};

export default Result;
