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
      description: "Advanced AI vision technology analyzes product labels in real-time."
    },
    {
      icon: BarChart3,
      title: "ToxiScore™ Algorithm",
      description: "Smart scoring system analyzing ingredients against scientific research and safety databases."
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

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Health Conscious Parent",
      content: "Purelytics has completely changed how I shop for my family. I finally feel confident about the products we use.",
      rating: 5
    },
    {
      name: "Arjun Patel",
      role: "Fitness Enthusiast",
      content: "The instant analysis is incredible. I've discovered so many healthier alternatives I never knew existed.",
      rating: 5
    },
    {
      name: "Dr. Kavita Reddy",
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
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-primary/50">
                <span className="text-sm font-black text-primary-foreground tracking-wider">PLY</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
              <Button variant="ghost" onClick={() => navigate("/about")}>About Us</Button>
              <Button variant="ghost" onClick={() => navigate("/contact")}>Contact</Button>
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
              <button onClick={() => { navigate("/about"); setMobileMenuOpen(false); }} className="text-muted-foreground hover:text-foreground transition-colors text-left">About Us</button>
              <button onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }} className="text-muted-foreground hover:text-foreground transition-colors text-left">Contact</button>
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
      <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-12 md:pt-0 md:pb-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-40 h-40 md:w-72 md:h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 md:w-64 md:h-64 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1.1]">
                {"Purelytics".split("").map((letter, i) => (
                  <span 
                    key={i} 
                    className="inline-block hover:text-primary transition-all duration-300"
                    style={{
                      animation: `letter-slide 0.5s ease-out forwards`,
                      animationDelay: `${i * 0.05}s`,
                      opacity: 0
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-tight animate-slide-in-left" style={{ animationDelay: '0.6s' }}>
                Take Control of Your Health Today
              </p>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2 sm:px-4 animate-slide-in-left" style={{ animationDelay: '0.8s' }}>
              Scan any product and get instant insights into its ingredients with our advanced AI technology. Make informed decisions for a healthier lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 md:pt-8 animate-slide-in-left px-4 sm:px-0" style={{ animationDelay: '1s' }}>
              <Button
                size="lg"
                onClick={() => navigate(user ? "/scan" : "/auth")}
                className="text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 md:h-16 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary/50 animate-glow"
              >
                {user ? "Start Scanning" : "Get Started Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 md:h-16 hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 sm:py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold px-4 sm:px-0">Why Choose Purelytics</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
              The most comprehensive health intelligence platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      <section id="how-it-works" className="container mx-auto px-4 py-16 sm:py-20 md:py-32 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">Simple. Fast. Accurate.</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Get instant insights in three simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
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
                description: "Advanced algorithms cross-reference ingredients against scientific research and safety databases."
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
      <section id="testimonials" className="container mx-auto px-4 py-16 sm:py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">What Our Users Say</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground">
              Real people, real results
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
      <section className="container mx-auto px-4 py-12 sm:py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-8 sm:p-12 md:p-16 border border-primary/20 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight px-4 sm:px-0">
            Take Control of
            <span className="block text-primary mt-2">Your Health Today</span>
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Start making informed decisions about the products you use every day.
          </p>
          <Button 
            size="lg" 
            className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate(user ? "/scan" : "/auth")}
          >
            <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            {user ? "Start Scanning Now" : "Get Started Free"}
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-b from-card/50 to-card backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-black text-primary-foreground tracking-wider">PLY</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering consumers with transparent product safety insights through advanced AI technology.
              </p>
              <div className="flex gap-4 pt-4">
                <a href="#" className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="/scan" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Start Scanning</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">About Us</a></li>
                <li><a href="#blog" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Blog</a></li>
                <li><a href="#careers" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Careers</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors hover:translate-x-1 inline-block">Help Center</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
              <p className="text-muted-foreground">&copy; 2025 Purelytics. All rights reserved.</p>
              <div className="flex items-center gap-4 group cursor-default">
                <svg className="h-12 w-12 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="url(#gradient)" strokeWidth="2"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#FF9933', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: 'white', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#138808', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <g className="animate-spin origin-center" style={{ animationDuration: '8s', transformOrigin: '50% 50%' }}>
                    <circle cx="50" cy="50" r="3" fill="#000080"/>
                    {[...Array(24)].map((_, i) => {
                      const angle = (i * 15 * Math.PI) / 180;
                      const x1 = 50 + 8 * Math.cos(angle);
                      const y1 = 50 + 8 * Math.sin(angle);
                      const x2 = 50 + 40 * Math.cos(angle);
                      const y2 = 50 + 40 * Math.sin(angle);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000080" strokeWidth="0.8"/>;
                    })}
                  </g>
                </svg>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-primary to-green-600 tracking-wide group-hover:scale-105 transition-transform duration-300">
                    Proudly Made in Bharat
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">Empowering Health & Wellness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
