import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Sparkles, Zap, CheckCircle, Camera, BarChart3, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Camera,
      title: "Instant Scanning",
      description: "Point your camera at any product and get instant analysis powered by AI vision technology."
    },
    {
      icon: BarChart3,
      title: "ToxiScore™",
      description: "Our proprietary algorithm calculates a safety score based on ingredient toxicity levels."
    },
    {
      icon: Sparkles,
      title: "AI Explanations",
      description: "Get clear, human-readable explanations of what each ingredient means for your health."
    },
    {
      icon: Shield,
      title: "Safer Alternatives",
      description: "Discover healthier product recommendations tailored to your safety preferences."
    }
  ];

  const benefits = [
    "Detect hidden toxic ingredients in seconds",
    "Make informed purchasing decisions",
    "Protect your family's health",
    "Access a growing database of 10,000+ products",
    "Get personalized recommendations",
    "Track your scan history"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Product Safety Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Know What's
            <span className="block text-primary">Really Inside</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Scan any product with your camera and instantly discover hidden toxic ingredients. 
            Get AI-powered safety scores and healthier alternatives in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8"
              onClick={() => navigate("/scan")}
            >
              <Camera className="mr-2 h-5 w-5" />
              Start Scanning
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8"
              onClick={() => navigate("/auth")}
            >
              Sign Up Free
            </Button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Instant results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Purelytics Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Why Purelytics?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The average person is exposed to over 200 toxic chemicals daily. 
              We're here to change that.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">The Problem</h3>
                  <p className="text-muted-foreground">
                    Hidden chemicals in everyday products are linked to hormone disruption, 
                    allergies, and serious health issues. Labels are confusing and regulations vary.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Our Solution</h3>
                  <p className="text-muted-foreground">
                    Purelytics uses advanced AI to analyze ingredients in real-time, 
                    providing instant safety scores and personalized recommendations for healthier choices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Your Peace of Mind</h3>
                  <p className="text-muted-foreground">
                    Make confident, informed decisions about the products you bring home. 
                    Protect your family's health with every scan.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6">By the Numbers</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold text-primary">10,000+</div>
                  <div className="text-muted-foreground">Products analyzed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">1,000+</div>
                  <div className="text-muted-foreground">Toxic ingredients tracked</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">&lt;3s</div>
                  <div className="text-muted-foreground">Average scan time</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">85%+</div>
                  <div className="text-muted-foreground">Detection accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make safer, healthier choices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/50"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">What You Get</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands making safer choices every day
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
              >
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center space-y-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 border border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold">
            Start Your Journey to
            <span className="block text-primary">Safer Products Today</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join the movement towards healthier living. Scan your first product now.
          </p>
          <Button 
            size="lg" 
            className="text-lg h-14 px-8"
            onClick={() => navigate("/scan")}
          >
            <Camera className="mr-2 h-5 w-5" />
            Start Scanning for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Purelytics. Making the world safer, one scan at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
