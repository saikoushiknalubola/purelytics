import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Database, Users, Shield, ArrowLeft, Download, TrendingUp, Activity, Package, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardStats {
  totalIngredients: number;
  totalProducts: number;
  totalUsers: number;
  avgToxiScore: number;
  highRiskProducts: number;
  hazardDistribution: { name: string; value: number }[];
  recentScans: {
    name: string;
    brand: string | null;
    toxiscore: number | null;
    created_at: string;
    color_code: string | null;
  }[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalIngredients: 0,
    totalProducts: 0,
    totalUsers: 0,
    avgToxiScore: 0,
    highRiskProducts: 0,
    hazardDistribution: [],
    recentScans: []
  });

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Parallel fetch all data
      const [ingredientResult, productsResult, userResult, ingredientsForHazard, recentScansResult] = await Promise.all([
        supabase.from('ingredients').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('toxiscore, color_code'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('ingredients').select('hazard_type'),
        supabase.from('products').select('name, brand, toxiscore, created_at, color_code').order('created_at', { ascending: false }).limit(10)
      ]);

      const productCount = productsResult.data?.length || 0;
      const avgScore = productsResult.data?.reduce((sum, p) => sum + (Number(p.toxiscore) || 0), 0) / (productCount || 1);
      const highRisk = productsResult.data?.filter(p => Number(p.toxiscore) >= 70).length || 0;

      // Build hazard distribution
      const hazardMap: Record<string, number> = {};
      ingredientsForHazard.data?.forEach(ing => {
        const type = ing.hazard_type || 'Unknown';
        hazardMap[type] = (hazardMap[type] || 0) + 1;
      });
      const hazardDistribution = Object.entries(hazardMap).map(([name, value]) => ({ name, value }));

      setStats({
        totalIngredients: ingredientResult.count || 0,
        totalProducts: productCount,
        totalUsers: userResult.count || 0,
        avgToxiScore: Math.round(avgScore),
        highRiskProducts: highRisk,
        hazardDistribution,
        recentScans: recentScansResult.data || []
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and realtime subscription
  useEffect(() => {
    loadStats();

    // Subscribe to realtime changes on products table
    const productsChannel = supabase
      .channel('admin-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadStats();
      })
      .subscribe();

    // Subscribe to realtime changes on ingredients table
    const ingredientsChannel = supabase
      .channel('admin-ingredients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients' }, () => {
        loadStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(ingredientsChannel);
    };
  }, [loadStats]);

  const downloadData = async (type: 'ingredients' | 'products' | 'users') => {
    try {
      let data: unknown[] = [];
      let filename = '';

      switch (type) {
        case 'ingredients':
          const { data: ingredients } = await supabase.from('ingredients').select('*').order('name');
          data = ingredients || [];
          filename = 'ingredients.json';
          break;
        case 'products':
          const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });
          data = products || [];
          filename = 'products.json';
          break;
        case 'users':
          const { data: users } = await supabase.from('user_roles').select('*');
          data = users || [];
          filename = 'users.json';
          break;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`${type} data downloaded successfully`);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      toast.error(`Failed to download ${type} data`);
    }
  };

  const COLORS = ['hsl(142, 76%, 36%)', 'hsl(48, 96%, 53%)', 'hsl(25, 95%, 53%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)'];

  const getScoreColor = (colorCode: string | null) => {
    switch (colorCode) {
      case 'red': return 'bg-destructive/20 text-destructive';
      case 'orange': return 'bg-orange-500/20 text-orange-600';
      case 'yellow': return 'bg-yellow-500/20 text-yellow-700';
      default: return 'bg-green-500/20 text-green-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-primary/10 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary hidden sm:block" />
              <h1 className="text-base sm:text-xl font-bold truncate">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={loadStats} disabled={isLoading} className="hover:bg-primary/10">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="hover:bg-primary/10 hidden sm:flex">
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">Welcome, Admin</h2>
            <p className="text-sm text-muted-foreground">Manage your Purelytics platform</p>
          </div>

          {/* Stats Grid - Mobile first 2x2, then 4 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="hover:shadow-lg transition-all border">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Ingredients</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalIngredients}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Database entries</p>
                <Button variant="ghost" size="sm" className="mt-2 w-full text-xs h-8" onClick={() => downloadData('ingredients')}>
                  <Download className="mr-1 h-3 w-3" /> Export
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalProducts}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total analyses</p>
                <Button variant="ghost" size="sm" className="mt-2 w-full text-xs h-8" onClick={() => downloadData('products')}>
                  <Download className="mr-1 h-3 w-3" /> Export
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.totalUsers}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Registered</p>
                <Button variant="ghost" size="sm" className="mt-2 w-full text-xs h-8" onClick={() => downloadData('users')}>
                  <Download className="mr-1 h-3 w-3" /> Export
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Avg ToxiScore</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stats.avgToxiScore}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stats.highRiskProducts} high-risk</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid - Stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Hazard Distribution */}
            <Card className="border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Hazard Distribution
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Ingredient hazard categories</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {stats.hazardDistribution.length > 0 ? (
                  <div className="w-full h-[280px] sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.hazardDistribution}
                          cx="50%"
                          cy="45%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {stats.hazardDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }} 
                        />
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Scans */}
            <Card className="border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Recent Scans
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest product analyses</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1">
                  {stats.recentScans.length > 0 ? (
                    stats.recentScans.map((scan, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card/50 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{scan.name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{scan.brand || 'Unknown brand'}</p>
                        </div>
                        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${getScoreColor(scan.color_code)}`}>
                          {Math.round(Number(scan.toxiscore) || 0)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                      No scans yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tools */}
          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold">Management Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card className="hover:shadow-lg transition-all cursor-pointer border" onClick={() => navigate('/admin/ingredients')}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Ingredient Database</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Add, edit, or remove ingredients</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Button className="w-full" size="sm">Manage Ingredients</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer border" onClick={() => navigate('/admin/analytics')}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Analytics Dashboard</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">View scan trends and insights</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Button className="w-full" size="sm">View Analytics</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border opacity-60">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">User Management</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Coming soon</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Button className="w-full" size="sm" disabled>Coming Soon</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
