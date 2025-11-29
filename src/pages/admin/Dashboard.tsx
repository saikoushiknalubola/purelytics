import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Database, Users, Shield, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalIngredients: 0,
    totalProducts: 0,
    totalUsers: 0
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

      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get user roles count
      const { count: userCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalIngredients: ingredientCount || 0,
        totalProducts: productCount || 0,
        totalUsers: userCount || 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

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

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Ingredients
                </CardTitle>
                <CardDescription>Database entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{stats.totalIngredients}</div>
                <p className="text-sm text-muted-foreground mt-2">Total ingredient records</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Products Scanned
                </CardTitle>
                <CardDescription>User scans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{stats.totalProducts}</div>
                <p className="text-sm text-muted-foreground mt-2">Total product analyses</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Users
                </CardTitle>
                <CardDescription>Platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{stats.totalUsers}</div>
                <p className="text-sm text-muted-foreground mt-2">Registered users</p>
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
