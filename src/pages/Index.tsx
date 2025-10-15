import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, Sparkles, Zap, CheckCircle, Camera, BarChart3, TrendingUp, Lock, Users, Globe, Menu, X, ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Camera,
      title: "Instant Scanning",
      description: "Advanced AI vision technology analyzes product labels in real-time with 99% accuracy."
    },
    {
      icon: BarChart3,
      title: "ToxiScore™ Algorithm",
      description: "Proprietary scoring system backed by scientific research and regulatory databases."
    },
    {
      icon: Shield,
      title: "Health Protection",
      description: "Identify harmful chemicals and allergens before they affect your health."
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description: "Get personalized safer alternatives based on your preferences and needs."
    },
    {
      icon: TrendingUp,
      title: "Track Your Journey",
      description: "Monitor your health choices over time with detailed analytics and insights."
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data is encrypted and never shared. Complete control over your information."
    }
  ];

  const stats = [
    { value: "500K+", label: "Products Scanned" },
    { value: "50K+", label: "Active Users" },
    { value: "10K+", label: "Ingredients Database" },
    { value: "99%", label: "Accuracy Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Health Conscious Parent",
      content: "Purelytics has completely changed how I shop for my family. I finally feel confident about the products we use.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Fitness Enthusiast",
      content: "The instant analysis is incredible. I've discovered so many healthier alternatives I never knew existed.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Dermatologist",
      content: "As a medical professional, I recommend Purelytics to all my patients. The science-backed data is reliable.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Purelytics
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate("/profile")}>Profile</Button>
                  <Button onClick={() => navigate("/scan")}>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
                  <Button onClick={() => navigate("/auth")}>Get Started</Button>
                </>
              )}
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
            <nav className="md:hidden py-4 flex flex-col gap-4 border-t border-border">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate("/profile")} className="justify-start">Profile</Button>
                  <Button onClick={() => navigate("/scan")} className="justify-start">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")} className="justify-start">Sign In</Button>
                  <Button onClick={() => navigate("/auth")} className="justify-start">Get Started</Button>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 md:pt-32 pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Health Intelligence Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            Decode Every
            <span className="block bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
              Product Label
            </span>
            <span className="block">In Seconds</span>
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Make informed decisions with AI-powered ingredient analysis. Protect your health with science-backed insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate(user ? "/scan" : "/auth")}
            >
              <Camera className="mr-2 h-5 w-5" />
              {user ? "Start Scanning" : "Get Started Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg h-14 px-8"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12 border-y border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">Why Choose Purelytics</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The most comprehensive health intelligence platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 md:py-32 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">Simple. Fast. Accurate.</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Get instant insights in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Camera,
                title: "Scan Product",
                description: "Point your camera at any product label. Our AI instantly captures and reads the ingredient list."
              },
              {
                step: "02",
                icon: Sparkles,
                title: "AI Analysis",
                description: "Advanced algorithms cross-reference 10,000+ ingredients against scientific research and safety databases."
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Get Results",
                description: "Receive your ToxiScore™, detailed ingredient breakdown, and personalized safer alternatives instantly."
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-card border-2 border-border rounded-2xl p-8 hover:border-primary/50 transition-all h-full">
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6">
                    <item.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">Loved by Thousands</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">
              See what our users have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-12 md:p-16 border border-primary/20 shadow-2xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Take Control of
            <span className="block text-primary">Your Health Today</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of health-conscious individuals making smarter choices every day.
          </p>
          <Button 
            size="lg" 
            className="text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate(user ? "/scan" : "/auth")}
          >
            <Camera className="mr-2 h-5 w-5" />
            {user ? "Start Scanning Now" : "Get Started Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-b from-secondary/50 to-secondary">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Purelytics
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Empowering healthier choices through AI-powered product intelligence. Make informed decisions for you and your family.
              </p>
              <div className="flex gap-4">
                <Globe className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Users className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground text-lg">Product</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a></li>
                <li><a href="/scan" className="hover:text-primary transition-colors">Start Scanning</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground text-lg">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="/auth" className="hover:text-primary transition-colors">Sign Up</a></li>
                <li><a href="/profile" className="hover:text-primary transition-colors">Profile</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              &copy; 2025 Purelytics. Building a healthier future with AI.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
