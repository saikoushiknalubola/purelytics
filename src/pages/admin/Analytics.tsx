import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Shield, Download, Calendar, TrendingUp, Package, RefreshCw } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays } from "date-fns";

interface ScanData {
  date: string;
  scans: number;
  avgToxiScore: number;
}

interface CategoryData {
  category: string;
  count: number;
  avgScore: number;
}

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const [scanTrends, setScanTrends] = useState<ScanData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [toxiScoreTrend, setToxiScoreTrend] = useState<ScanData[]>([]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process scan trends by day
      const scansByDay: Record<string, { count: number; totalScore: number }> = {};
      
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), days - i - 1), 'MMM dd');
        scansByDay[date] = { count: 0, totalScore: 0 };
      }

      products?.forEach(product => {
        const dateKey = format(new Date(product.created_at), 'MMM dd');
        if (scansByDay[dateKey]) {
          scansByDay[dateKey].count++;
          scansByDay[dateKey].totalScore += Number(product.toxiscore) || 0;
        }
      });

      const scanTrendData = Object.entries(scansByDay).map(([date, data]) => ({
        date,
        scans: data.count,
        avgToxiScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0
      }));

      setScanTrends(scanTrendData);
      setToxiScoreTrend(scanTrendData);

      // Process category data
      const categoryMap: Record<string, { count: number; totalScore: number }> = {};
      
      products?.forEach(product => {
        const category = product.category || 'Uncategorized';
        if (!categoryMap[category]) {
          categoryMap[category] = { count: 0, totalScore: 0 };
        }
        categoryMap[category].count++;
        categoryMap[category].totalScore += Number(product.toxiscore) || 0;
      });

      const categoryDataArray = Object.entries(categoryMap)
        .map(([category, data]) => ({
          category,
          count: data.count,
          avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0
        }))
        .sort((a, b) => b.count - a.count);

      setCategoryData(categoryDataArray);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Initial load and realtime subscription
  useEffect(() => {
    loadAnalytics();

    // Subscribe to realtime changes on products table
    const channel = supabase
      .channel('analytics-products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAnalytics]);

  const downloadAnalytics = () => {
    const analyticsData = {
      timeRange: `${timeRange} days`,
      generatedAt: new Date().toISOString(),
      scanTrends,
      categoryData,
      toxiScoreTrend
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}days-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Analytics data exported");
  };

  const COLORS = ['hsl(142, 76%, 36%)', 'hsl(48, 96%, 53%)', 'hsl(25, 95%, 53%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)', 'hsl(280, 65%, 60%)', 'hsl(160, 60%, 45%)'];

  const totalScans = scanTrends.reduce((sum, day) => sum + day.scans, 0);
  const avgDailyScans = totalScans / parseInt(timeRange);
  const overallAvgToxiScore = totalScans > 0 
    ? Math.round(scanTrends.reduce((sum, day) => sum + (day.avgToxiScore * day.scans), 0) / totalScans) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg px-3 sm:px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="hover:bg-primary/10 shrink-0 h-8 w-8 sm:h-9 sm:w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h1 className="text-sm sm:text-xl font-bold truncate">Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" onClick={loadAnalytics} disabled={loading} className="hover:bg-primary/10 h-8 w-8 sm:h-9 sm:w-9">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadAnalytics} className="gap-1 text-[10px] sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <div className="space-y-3 sm:space-y-6">
          {/* Title and Time Range */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">Platform Analytics</h2>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Live scan trends and product insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px] sm:w-[180px] h-8 sm:h-9 text-[10px] sm:text-sm">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card className="border">
              <CardHeader className="p-2 sm:p-4 pb-0.5 sm:pb-2">
                <CardTitle className="text-[9px] sm:text-sm font-medium">Total Scans</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <div className="text-lg sm:text-3xl font-bold text-primary">{totalScans}</div>
                <p className="text-[8px] sm:text-xs text-muted-foreground">last {timeRange} days</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="p-2 sm:p-4 pb-0.5 sm:pb-2">
                <CardTitle className="text-[9px] sm:text-sm font-medium">Daily Avg</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <div className="text-lg sm:text-3xl font-bold text-primary">{avgDailyScans.toFixed(1)}</div>
                <p className="text-[8px] sm:text-xs text-muted-foreground">scans/day</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="p-2 sm:p-4 pb-0.5 sm:pb-2">
                <CardTitle className="text-[9px] sm:text-sm font-medium">Avg Score</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <div className="text-lg sm:text-3xl font-bold text-primary">{overallAvgToxiScore}</div>
                <p className="text-[8px] sm:text-xs text-muted-foreground">ToxiScore</p>
              </CardContent>
            </Card>
          </div>

          {/* Scan Trends Chart */}
          <Card className="border">
            <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Scan Trends
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">Product scans over time</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              {loading ? (
                <div className="h-[180px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
                  Loading...
                </div>
              ) : scanTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={180} className="sm:!h-[280px]">
                  <LineChart data={scanTrends} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={8} tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={8} tick={{ fontSize: 8 }} width={25} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                    <Line type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={2} name="Scans" dot={{ r: 2, fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">No data</div>
              )}
            </CardContent>
          </Card>

          {/* ToxiScore Trends Chart */}
          <Card className="border">
            <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                ToxiScore Trends
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">Average ToxiScore over time</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 pt-0">
              {loading ? (
                <div className="h-[180px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
                  Loading...
                </div>
              ) : toxiScoreTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={180} className="sm:!h-[280px]">
                  <LineChart data={toxiScoreTrend} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={8} tick={{ fontSize: 8 }} interval="preserveStartEnd" />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={8} tick={{ fontSize: 8 }} domain={[0, 100]} width={25} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                    <Line type="monotone" dataKey="avgToxiScore" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Avg ToxiScore" dot={{ r: 2, fill: 'hsl(0, 84%, 60%)' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] sm:h-[280px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">No data</div>
              )}
            </CardContent>
          </Card>

          {/* Category Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <Card className="border">
              <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Categories
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-sm">Distribution by category</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                {loading ? (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">Loading...</div>
                ) : categoryData.length > 0 ? (
                  <div className="w-full h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="40%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="count">
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '8px', paddingTop: '6px' }} formatter={(value) => <span className="text-[8px] sm:text-[10px]">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">No data</div>
                )}
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Category Scores
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-sm">Avg ToxiScore by category</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                {loading ? (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">Loading...</div>
                ) : categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
                    <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -15, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={7} angle={-45} textAnchor="end" height={50} tick={{ fontSize: 7 }} interval={0} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={8} domain={[0, 100]} width={25} tick={{ fontSize: 8 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                      <Bar dataKey="avgScore" fill="hsl(var(--primary))" name="Avg ToxiScore" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] sm:h-[250px] flex items-center justify-center text-muted-foreground text-xs sm:text-sm">No data</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
