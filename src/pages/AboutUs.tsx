import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Eye, Heart, Users, TrendingUp, Globe } from "lucide-react";

const AboutUs = () => {
  const navigate = useNavigate();

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
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent">
            About Purelytics
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Empowering healthier choices through intelligent technology
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg">
                <Users className="h-16 w-16 text-primary-foreground" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Founded by Saikoushik Nalubola</h2>
                <p className="text-xl text-muted-foreground">Established in 2025</p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  With a passion for health technology and consumer safety, Saikoushik Nalubola founded Purelytics to bridge the gap between complex ingredient labels and everyday consumers. Our mission is to democratize health information and empower individuals to make informed choices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg">
              <Eye className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To create a world where every individual has instant access to comprehensive product safety information, enabling healthier choices for themselves and their families. We envision a future where transparency is the norm, not the exception.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center mb-6 shadow-lg">
              <Target className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To leverage cutting-edge AI technology to analyze and decode product ingredients, providing clear, actionable insights that empower consumers to make informed health decisions. We're committed to making product safety accessible to everyone.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/60 flex items-center justify-center mb-6 shadow-lg">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Values</h3>
            <p className="text-muted-foreground leading-relaxed">
              Transparency, scientific accuracy, and user privacy are at the core of everything we do. We believe in empowering individuals with knowledge while respecting their data and privacy. Your health journey is personal, and we're here to support it.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">What We Do</h2>
            <p className="text-xl text-muted-foreground">
              Revolutionizing how people understand product safety
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:bg-card/50 transition-all duration-300">
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Advanced AI Analysis</h3>
              <p className="text-muted-foreground">
                Our proprietary ToxiScore™ algorithm analyzes thousands of ingredients against scientific databases to provide instant safety ratings.
              </p>
            </div>

            <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:bg-card/50 transition-all duration-300">
              <Globe className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-Time Scanning</h3>
              <p className="text-muted-foreground">
                Simply scan any product label with your phone camera and get comprehensive ingredient analysis in seconds.
              </p>
            </div>

            <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:bg-card/50 transition-all duration-300">
              <Heart className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Personalized Insights</h3>
              <p className="text-muted-foreground">
                Receive tailored recommendations based on your health profile and preferences for safer product alternatives.
              </p>
            </div>

            <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:bg-card/50 transition-all duration-300">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-muted-foreground">
                Join thousands of health-conscious users making smarter choices and contributing to a healthier future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Made in India Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 border border-border/50">
            <div className="text-6xl mb-4 animate-pulse">🇮🇳</div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Proudly Made in India</h3>
            <p className="text-muted-foreground text-lg">
              Built with pride in Bharat, serving the world with innovation and dedication to health and wellness.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-12 border border-border/50">
          <h2 className="text-4xl md:text-5xl font-bold">Join Us on Our Mission</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Be part of the health revolution. Start making informed choices today.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/50"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
