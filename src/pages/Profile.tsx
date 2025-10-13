import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";

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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

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
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <img src={logo} alt="Purelytics" className="h-8" />
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Profile</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Scan History</h2>
          </div>

          {scanHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No scans yet. Start scanning products to build your history!
            </p>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/result/${scan.id}`)}
                  className="p-4 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{scan.name}</p>
                      {scan.brand && (
                        <p className="text-sm text-muted-foreground">
                          {scan.brand}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          scan.color_code === "green"
                            ? "bg-success"
                            : scan.color_code === "yellow"
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      />
                      <span className="font-semibold">{scan.toxiscore}</span>
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
