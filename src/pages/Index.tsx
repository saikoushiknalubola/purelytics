import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Sparkles, Zap, CheckCircle, Camera, BarChart3, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jpeg";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logo} alt="Purelytics" className="h-10 w-10 rounded-lg" />
              <span className="text-xl font-bold text-foreground">Purelytics</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
              <Button onClick={() => navigate("/scan")}>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
              <Button variant="ghost" onClick={() => navigate("/auth")} className="justify-start">Sign In</Button>
              <Button onClick={() => navigate("/scan")} className="justify-start">
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 md:pt-24 pb-20 md:pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-xs md:text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Product Safety Scanner</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight px-4">
            Scan Products.
            <span className="block text-primary">Reveal Toxins.</span>
            <span className="block">Live Healthier.</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Point your camera at any product label and instantly get AI-powered ingredient analysis, toxicity scores, and safer alternatives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2 md:pt-4 px-4">
            <Button 
              size="lg" 
              className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8"
              onClick={() => navigate("/scan")}
            >
              <Camera className="mr-2 h-4 md:h-5 w-4 md:w-5" />
              Try It Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8"
              onClick={() => navigate("/auth")}
            >
              Sign Up
            </Button>
          </div>

          <div className="pt-6 md:pt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-success" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-success" />
              <span>No Sign-up Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-success" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* What is Purelytics Section */}
      <section id="about" className="container mx-auto px-4 py-12 md:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">What is Purelytics?</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Purelytics is an AI-powered mobile scanning tool that helps you understand what's really in the products you use every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3">The Problem We Solve</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Thousands of chemicals hide in everyday products—cosmetics, cleaners, food items. Many have been linked to health concerns like hormone disruption, skin irritation, and allergies. Product labels are often complex and misleading, making it nearly impossible for consumers to make truly informed choices.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3">Our Solution</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                With Purelytics, simply point your phone camera at any product. Our AI instantly reads the ingredient list, analyzes each component against a comprehensive toxicity database, and provides you with a clear safety score. No more guessing—just scan and know.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-12 md:py-20 border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">How It Works</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Get ingredient insights in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs md:text-sm font-semibold mb-3">Step 1</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Scan the Product</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Open the app and point your camera at the product label or ingredient list.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs md:text-sm font-semibold mb-3">Step 2</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Our AI reads ingredients, checks our toxicity database, and calculates a safety score.
                </p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs md:text-sm font-semibold mb-3">Step 3</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Get Results</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  View your ToxiScore™, flagged ingredients, explanations, and safer alternatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">Powerful Features</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Everything you need to make informed, healthier choices
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-5 md:p-6 hover:shadow-lg transition-all hover:border-primary/50"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 border-t border-border bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3 md:space-y-4 mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">Why Choose Purelytics</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground px-4">
              Make informed decisions with confidence
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 md:p-4 rounded-lg bg-card border border-border"
              >
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" />
                <span className="text-foreground text-sm md:text-base">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl md:rounded-2xl p-8 md:p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold px-4">
            Ready to Make
            <span className="block text-primary">Safer Choices?</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground px-4">
            Start scanning products today and take control of your health.
          </p>
          <Button 
            size="lg" 
            className="text-base md:text-lg h-12 md:h-14 px-6 md:px-8"
            onClick={() => navigate("/scan")}
          >
            <Camera className="mr-2 h-4 md:h-5 w-4 md:w-5" />
            Try Purelytics Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="Purelytics" className="h-8 w-8 rounded-lg" />
                <span className="text-lg font-bold text-foreground">Purelytics</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                AI-powered product safety scanner that helps you make informed, healthier choices for you and your family.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a></li>
                <li><a href="/scan" className="hover:text-foreground transition-colors">Start Scanning</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="/auth" className="hover:text-foreground transition-colors">Sign Up</a></li>
                <li><a href="/profile" className="hover:text-foreground transition-colors">Profile</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              &copy; 2025 Purelytics. Empowering healthier choices through AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
