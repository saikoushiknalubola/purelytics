import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, ArrowLeft, Eye, EyeOff, User, Lock, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email too long" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password too long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
});

type AuthMode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const emailValidation = z.string().email().safeParse(email);
        if (!emailValidation.success) {
          throw new Error("Please enter a valid email address");
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
        setEmailSent(true);
        toast.success("Password reset email sent! Check your inbox.");
        return;
      }

      const validated = authSchema.parse({ email, password });

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName.trim() || null,
            },
          },
        });
        if (error) throw error;
        setEmailSent(true);
        toast.success("Account created! Check your email to verify your account.");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error.message?.includes("User already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "forgot":
        return "Reset Password";
      case "signup":
        return "Create Account";
      default:
        return "Welcome Back";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "forgot":
        return "Enter your email and we'll send you a reset link";
      case "signup":
        return "Join Purelytics and start your wellness journey";
      default:
        return "Sign in to continue making healthier choices";
    }
  };

  // Email confirmation sent screen
  if (emailSent && (mode === "signup" || mode === "forgot")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 h-72 w-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 h-96 w-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <Card className="w-full max-w-md p-8 space-y-6 backdrop-blur-sm bg-card/80 border-2 shadow-2xl relative z-10 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-success via-success/80 to-success/60 flex items-center justify-center shadow-xl animate-scale-in">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {mode === "signup" ? "Check Your Email" : "Reset Link Sent"}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {mode === "signup" 
                  ? `We've sent a verification link to ${email}. Please check your inbox and click the link to activate your account.`
                  : `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.`
                }
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={() => {
                setEmailSent(false);
                setMode("login");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button 
                onClick={() => setEmailSent(false)} 
                className="text-primary hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-72 w-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 h-96 w-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 backdrop-blur-sm bg-card/80 border-2 shadow-2xl relative z-10 animate-fade-in">
        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
        )}

        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 animate-scale-in">
            {mode === "forgot" ? (
              <Mail className="h-7 w-7 text-primary-foreground" />
            ) : (
              <span className="text-xl font-black text-primary-foreground tracking-wider">PLY</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {getTitle()}
            </h1>
            <p className="text-muted-foreground text-sm">
              {getSubtitle()}
            </p>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signup" && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs text-muted-foreground">Password requirements:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
                    <li className={password.length >= 8 ? "text-success" : ""}>
                      {password.length >= 8 ? "✓" : "•"} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-success" : ""}>
                      {/[A-Z]/.test(password) ? "✓" : "•"} One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-success" : ""}>
                      {/[0-9]/.test(password) ? "✓" : "•"} One number
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 font-medium shadow-lg hover:shadow-xl transition-all mt-6" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : mode === "forgot" ? (
              "Send Reset Link"
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {mode !== "forgot" && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-2 hover:bg-secondary/80 transition-all"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/`,
                      },
                    });
                    if (error) throw error;
                  } catch (error: any) {
                    toast.error(error.message || "Failed to sign in with Google");
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 gap-2 hover:bg-secondary/80 transition-all"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'apple',
                      options: {
                        redirectTo: `${window.location.origin}/`,
                      },
                    });
                    if (error) throw error;
                  } catch (error: any) {
                    toast.error(error.message || "Failed to sign in with Apple");
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setEmailSent(false);
                }}
                className="text-sm text-primary hover:underline font-medium transition-colors"
              >
                {mode === "login"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;