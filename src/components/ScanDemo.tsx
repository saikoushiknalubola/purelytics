import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

const DEMO_PRODUCTS = [
  {
    id: "demo-shampoo",
    name: "Herbal Shampoo",
    score: 72,
    description: "Common hair care product with moderate safety score"
  },
  {
    id: "demo-snack",
    name: "Potato Chips",
    score: 45,
    description: "Processed snack with several flagged ingredients"
  },
  {
    id: "demo-lotion",
    name: "Body Lotion",
    score: 88,
    description: "Natural moisturizer with high safety rating"
  }
];

export const ScanDemo = () => {
  const navigate = useNavigate();

  const handleDemoProduct = async (productId: string) => {
    // For demo, we'll navigate to a result page
    // In a real implementation, you'd create demo data in the database
    navigate(`/result/${productId}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/20">
        <h3 className="font-bold text-lg mb-4 text-foreground">Try Demo Products</h3>
        <p className="text-sm text-muted-foreground mb-4">
          See how Purelytics analyzes real products. Click any demo to view full analysis:
        </p>
        
        <div className="grid gap-3">
          {DEMO_PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => handleDemoProduct(product.id)}
              className="text-left bg-card hover:bg-card/80 border-2 border-border hover:border-primary/50 rounded-lg p-4 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </span>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  product.score >= 70 ? 'bg-green-100 text-green-700' :
                  product.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {product.score}/100
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{product.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border-2 border-border rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 text-foreground">Photo Examples</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle className="h-5 w-5" />
              <span>Good Photos</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground pl-7">
              <li>✓ Clear ingredients list visible</li>
              <li>✓ Well-lit, no shadows</li>
              <li>✓ Text is sharp and readable</li>
              <li>✓ Full list captured (not cut off)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600 font-semibold">
              <XCircle className="h-5 w-5" />
              <span>Avoid These</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground pl-7">
              <li>✗ Blurry or out of focus</li>
              <li>✗ Only showing brand logo</li>
              <li>✗ Dark or shadowy images</li>
              <li>✗ Text cut off at edges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
