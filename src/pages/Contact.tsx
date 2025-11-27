import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

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
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            We'd love to hear from you. Reach out to us anytime!
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 animate-fade-in">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg">
                <Mail className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Email Us</h3>
              <a 
                href="mailto:purelytics@gmail.com"
                className="text-lg text-muted-foreground hover:text-primary transition-colors"
              >
                purelytics@gmail.com
              </a>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/60 flex items-center justify-center mb-6 shadow-lg">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Location</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Warangal, Telangana<br />
                India
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 shadow-xl">
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button 
                  type="submit"
                  size="lg"
                  className="w-full text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/50"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card/30 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden shadow-xl">
            <iframe
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=79.4941%2C17.9189%2C79.6941%2C18.0189&layer=mapnik&marker=17.9689%2C79.5941"
              title="Warangal, India Map"
            />
            <div className="p-4 text-center">
              <a 
                href="https://www.openstreetmap.org/?mlat=17.9689&mlon=79.5941#map=12/17.9689/79.5941"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View larger map
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
