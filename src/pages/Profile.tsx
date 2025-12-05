import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, History, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ScanHistory {
  id: string;
  name: string;
  brand: string;
  toxiscore: number;
  color_code: string;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('profile-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadUserData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Check if user is admin
      const { data: adminCheck } = await supabase.rpc('is_admin', {
        _user_id: user.id
      });
      setIsAdmin(adminCheck === true);

      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setScanHistory(products || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="hover:bg-primary/10 transition-all px-2 sm:px-3"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg">
              <span className="text-xs sm:text-sm font-black text-primary-foreground tracking-wider">PLY</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="hover:bg-destructive/10 hover:text-destructive transition-all px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-4xl space-y-4 sm:space-y-6 animate-fade-in">
        {/* Profile Card */}
        <Card className="p-4 sm:p-8 space-y-4 sm:space-y-6 bg-card/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shrink-0">
              <span className="text-lg sm:text-2xl font-black text-primary-foreground tracking-wider">PLY</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Your Profile</h2>
                {isAdmin && (
                  <Badge variant="default" className="gap-1 text-xs">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Manage your account and view activity</p>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-4 sm:pt-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                <p className="font-semibold text-sm sm:text-lg break-all">{user?.email}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Scans</p>
                <p className="font-semibold text-sm sm:text-lg">{scanHistory.length}</p>
              </div>
              {isAdmin && (
                <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5">Admin Access</p>
                        <p className="font-semibold text-sm sm:text-lg">Manage Platform</p>
                      </div>
                    </div>
                    <Button onClick={() => navigate("/admin")} variant="default" size="sm" className="w-full sm:w-auto">
                      Admin Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Scan History Card */}
        <Card className="p-4 sm:p-8 space-y-4 sm:space-y-6 bg-card/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <History className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Scan History</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Your recent product analyses</p>
            </div>
          </div>

          {scanHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <History className="h-8 w-8 sm:h-10 sm:w-10 text-primary/50" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-medium text-muted-foreground">No scans yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Start scanning products to build your history!</p>
              </div>
              <Button onClick={() => navigate("/scan")} className="mt-4" size="sm">
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/result/${scan.id}`)}
                  className="group p-3 sm:p-5 bg-gradient-to-br from-secondary/30 to-secondary/10 hover:from-secondary/50 hover:to-secondary/20 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:shadow-lg border border-border/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-lg group-hover:text-primary transition-colors truncate">{scan.name}</p>
                      {scan.brand && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                          {scan.brand}
                        </p>
                      )}
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                        {new Date(scan.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg ${
                          scan.color_code === "green"
                            ? "bg-success"
                            : scan.color_code === "yellow"
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      />
                      <span className="font-bold text-xl sm:text-2xl">{scan.toxiscore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Profile;