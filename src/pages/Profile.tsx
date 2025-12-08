import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, History, Shield, User, Mail, Phone, Edit2, Save, X, Zap, Gift, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ScanHistory {
  id: string;
  name: string;
  brand: string;
  toxiscore: number;
  color_code: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface UserPoints {
  points_balance: number;
  total_earned: number;
  scan_streak: number;
  last_scan_date: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('profile-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadUserData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
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

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditName(profileData.full_name || "");
        setEditPhone(profileData.phone || "");
      }

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

      // Fetch user points
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (pointsData) {
        setUserPoints(pointsData);
      }
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

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: editName.trim() || null,
          phone: editPhone.trim() || null,
        });

      if (error) throw error;

      setProfile({
        id: user.id,
        full_name: editName.trim() || null,
        phone: editPhone.trim() || null,
        avatar_url: profile?.avatar_url || null,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null, email: string | null): string => {
    if (name && name.trim()) {
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getDisplayName = (): string => {
    if (profile?.full_name) {
      return profile.full_name.split(" ")[0];
    }
    return user?.email?.split("@")[0] || "User";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
        </div>
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
        {/* Welcome Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {getGreeting()}, {getDisplayName()}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back to your wellness journey</p>
        </div>

        {/* Profile Card */}
        <Card className="p-4 sm:p-8 space-y-4 sm:space-y-6 bg-card/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Initials */}
            <div className="flex justify-center sm:justify-start">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-xl ring-4 ring-primary/20">
                <span className="text-2xl sm:text-3xl font-black text-primary-foreground tracking-wider">
                  {getInitials(profile?.full_name || null, user?.email)}
                </span>
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h2 className="text-xl sm:text-3xl font-bold">
                  {profile?.full_name || "Set Your Name"}
                </h2>
                {isAdmin && (
                  <Badge variant="default" className="gap-1 text-xs w-fit mx-auto sm:mx-0">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
          
          {/* Edit Form */}
          {isEditing && (
            <div className="border-t border-border/50 pt-4 sm:pt-6 space-y-4 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(profile?.full_name || "");
                    setEditPhone(profile?.phone || "");
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Profile Stats */}
          {!isEditing && (
            <div className="border-t border-border/50 pt-4 sm:pt-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">Email</p>
                      <p className="font-semibold text-sm truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Scans</p>
                      <p className="font-semibold text-sm">{scanHistory.length}</p>
                    </div>
                  </div>
                </div>

                {profile?.phone && (
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Phone</p>
                        <p className="font-semibold text-sm">{profile.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Admin Access</p>
                        <p className="font-semibold">Manage Platform</p>
                      </div>
                    </div>
                    <Button onClick={() => navigate("/admin")} variant="default" size="sm" className="w-full sm:w-auto">
                      Admin Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Points & Rewards Card */}
        <Card className="p-4 sm:p-8 space-y-4 sm:space-y-6 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Points & Rewards</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Earn points with every scan</p>
              </div>
            </div>
            {userPoints && userPoints.scan_streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-semibold">{userPoints.scan_streak} day streak</span>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Current Balance */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-black text-primary">{userPoints?.points_balance || 0}</p>
                </div>
              </div>
            </div>

            {/* Total Earned */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-black">{userPoints?.total_earned || 0}</p>
                </div>
              </div>
            </div>

            {/* Next Reward */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Next Reward</p>
                  <p className="text-sm font-semibold">{Math.max(0, 100 - (userPoints?.points_balance || 0))} pts away</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to Next Reward */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to 100 pts reward</span>
              <span className="font-semibold">{Math.min(100, userPoints?.points_balance || 0)}%</span>
            </div>
            <Progress value={Math.min(100, userPoints?.points_balance || 0)} className="h-3" />
          </div>

          {/* Rewards Section */}
          <div className="border-t border-border/50 pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Available Rewards</h3>
              <Badge variant="secondary" className="gap-1">
                <Gift className="h-3 w-3" />
                Coming Soon
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "10% Off Premium", points: 100, icon: "🎁" },
                { name: "Free Extra Scans", points: 200, icon: "📸" },
                { name: "Health Report", points: 300, icon: "📊" },
                { name: "Family Plan Discount", points: 500, icon: "👨‍👩‍👧‍👦" }
              ].map((reward, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{reward.icon}</span>
                      <span className="text-sm font-medium">{reward.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{reward.points} pts</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Earn 10 points per scan. Redeem rewards coming soon!
          </p>
        </Card>

        {/* Scan History Card */}
        <Card className="p-4 sm:p-8 space-y-4 sm:space-y-6 bg-card/80 backdrop-blur-sm border-2 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Scan History</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Your recent product analyses</p>
            </div>
          </div>

          {scanHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-12 space-y-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <History className="h-10 w-10 text-primary/50" />
              </div>
              <div>
                <p className="text-lg font-medium text-muted-foreground">No scans yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start scanning products to build your history</p>
              </div>
              <Button onClick={() => navigate("/scan")} className="mt-4 shadow-lg">
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/result/${scan.id}`)}
                  className="group p-4 sm:p-5 bg-gradient-to-br from-secondary/30 to-secondary/10 hover:from-secondary/50 hover:to-secondary/20 rounded-xl cursor-pointer transition-all hover:shadow-lg border border-border/50 hover:border-primary/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-lg group-hover:text-primary transition-colors truncate">{scan.name}</p>
                      {scan.brand && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                          {scan.brand}
                        </p>
                      )}
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                        {new Date(scan.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg ring-2 ring-offset-2 ring-offset-background ${
                          scan.color_code === "green"
                            ? "bg-success ring-success/30"
                            : scan.color_code === "yellow"
                            ? "bg-warning ring-warning/30"
                            : "bg-danger ring-danger/30"
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