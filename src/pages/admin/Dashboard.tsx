import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Database, Users, Shield, ArrowLeft, Download, TrendingUp, Activity, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIngredients: 0,
    totalProducts: 0,
    totalUsers: 0,
    avgToxiScore: 0,
    highRiskProducts: 0,
    hazardDistribution: [] as { name: string; value: number }[],
    recentScans: [] as any[]
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get ingredient count
      const { count: ingredientCount } = await supabase
        .from('ingredients')
        .select('*', { count: 'exact', head: true });

      // Get product count and average toxiscore
      const { data: productsData } = await supabase
        .from('products')
        .select('toxiscore, color_code');

      const productCount = productsData?.length || 0;
      const avgScore = productsData?.reduce((sum, p) => sum + (Number(p.toxiscore) || 0), 0) / (productCount || 1);
      const highRisk = productsData?.filter(p => Number(p.toxiscore) >= 70).length || 0;

      // Get user roles count
      const { count: userCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      // Get hazard type distribution
      const { data: ingredientsData } = await supabase
        .from('ingredients')
        .select('hazard_type');

      const hazardMap: { [key: string]: number } = {};
      ingredientsData?.forEach(ing => {
        hazardMap[ing.hazard_type] = (hazardMap[ing.hazard_type] || 0) + 1;
      });

      const hazardDistribution = Object.entries(hazardMap).map(([name, value]) => ({ name, value }));

      // Get recent scans
      const { data: recentScans } = await supabase
        .from('products')
        .select('name, brand, toxiscore, created_at, color_code')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalIngredients: ingredientCount || 0,
        totalProducts: productCount,
        totalUsers: userCount || 0,
        avgToxiScore: Math.round(avgScore),
        highRiskProducts: highRisk,
        hazardDistribution,
        recentScans: recentScans || []
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load analytics");
    }
  };

  const downloadData = async (type: 'ingredients' | 'products' | 'users') => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'ingredients':
          const { data: ingredients } = await supabase
            .from('ingredients')
            .select('*')
            .order('name');
          data = ingredients || [];
          filename = 'ingredients.json';
          break;
        case 'products':
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          data = products || [];
          filename = 'products.json';
          break;
        case 'users':
          const { data: users } = await supabase
            .from('user_roles')
            .select('*');
          data = users || [];
          filename = 'users.json';
          break;
      }

      // Create download
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

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/profile")}
            className="hover:bg-primary/10"
          >
            Profile
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome, Admin</h2>
            <p className="text-muted-foreground">Manage your Purelytics platform from here</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ingredients</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalIngredients}</div>
                <p className="text-xs text-muted-foreground mt-1">Database entries</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 w-full" 
                  onClick={() => downloadData('ingredients')}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Export
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Products Scanned</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Total analyses</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 w-full" 
                  onClick={() => downloadData('products')}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Export
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 w-full" 
                  onClick={() => downloadData('users')}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Export
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg ToxiScore</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.avgToxiScore}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.highRiskProducts} high-risk products</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Hazard Type Distribution
                </CardTitle>
                <CardDescription>Breakdown of ingredient hazard categories</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.hazardDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.hazardDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.hazardDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Scans
                </CardTitle>
                <CardDescription>Latest product analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {stats.recentScans.length > 0 ? (
                    stats.recentScans.map((scan, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{scan.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{scan.brand}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            scan.color_code === 'red' ? 'bg-red-500/20 text-red-600' :
                            scan.color_code === 'orange' ? 'bg-orange-500/20 text-orange-600' :
                            scan.color_code === 'yellow' ? 'bg-yellow-500/20 text-yellow-600' :
                            'bg-green-500/20 text-green-600'
                          }`}>
                            {Math.round(Number(scan.toxiscore) || 0)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      No scans yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Management Tools</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-2" onClick={() => navigate('/admin/ingredients')}>
                <CardHeader>
                  <CardTitle>Ingredient Database</CardTitle>
                  <CardDescription>Add, edit, or remove ingredients and their safety ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Manage Ingredients
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer border-2" onClick={() => navigate('/admin/analytics')}>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>View scan trends, product insights, and ToxiScore analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all border-2 opacity-60">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Coming soon: Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    Coming Soon
                  </Button>
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
