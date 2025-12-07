import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users,
  ArrowLeft,
  Shield,
  User,
  ScanLine,
  RefreshCw,
  Search,
  Crown,
  Mail,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface UserData {
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  scan_count: number;
  last_scan: string | null;
  role: "admin" | "user";
  created_at: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone");

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map<string, UserProfile>();
      profilesData?.forEach((p) => {
        profilesMap.set(p.id, p);
      });

      // Fetch all products grouped by user_id
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("user_id, created_at");

      if (productsError) throw productsError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const rolesMap = new Map<string, "admin" | "user">();
      rolesData?.forEach((r) => {
        rolesMap.set(r.user_id, r.role as "admin" | "user");
      });

      // Group products by user_id
      const userStatsMap = new Map<
        string,
        { scan_count: number; last_scan: string | null; created_at: string }
      >();

      productsData?.forEach((product) => {
        const existing = userStatsMap.get(product.user_id);
        if (existing) {
          existing.scan_count += 1;
          if (
            !existing.last_scan ||
            new Date(product.created_at) > new Date(existing.last_scan)
          ) {
            existing.last_scan = product.created_at;
          }
          if (new Date(product.created_at) < new Date(existing.created_at)) {
            existing.created_at = product.created_at;
          }
        } else {
          userStatsMap.set(product.user_id, {
            scan_count: 1,
            last_scan: product.created_at,
            created_at: product.created_at,
          });
        }
      });

      // Get unique user IDs from profiles, products, and roles
      const allUserIds = new Set([
        ...profilesMap.keys(),
        ...userStatsMap.keys(),
        ...rolesMap.keys(),
      ]);

      // Build user data array
      const userData: UserData[] = Array.from(allUserIds).map((userId) => {
        const stats = userStatsMap.get(userId);
        const profile = profilesMap.get(userId);
        return {
          user_id: userId,
          email: `User ${userId.substring(0, 8)}...`,
          full_name: profile?.full_name || null,
          phone: profile?.phone || null,
          scan_count: stats?.scan_count || 0,
          last_scan: stats?.last_scan || null,
          role: rolesMap.get(userId) || "user",
          created_at: stats?.created_at || new Date().toISOString(),
        };
      });

      // Sort by scan count descending
      userData.sort((a, b) => b.scan_count - a.scan_count);
      setUsers(userData);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up realtime subscription
    const channel = supabase
      .channel("admin-users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchUsers()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        () => fetchUsers()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    try {
      if (newRole === "admin") {
        // Check if role already exists
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", userId)
          .eq("role", "admin")
          .single();

        if (!existingRole) {
          const { error } = await supabase.from("user_roles").insert({
            user_id: userId,
            role: "admin",
          });
          if (error) throw error;
        }
      } else {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      }

      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const getInitials = (name: string | null, userId: string): string => {
    if (name && name.trim()) {
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return userId.substring(0, 2).toUpperCase();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="shrink-0 hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground">
                {users.length} registered users
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-end sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="text-xl font-bold">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-success/10 rounded-xl">
                <ScanLine className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Scans</p>
                <p className="text-xl font-bold">
                  {users.reduce((acc, u) => acc + u.scan_count, 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Today</p>
                <p className="text-xl font-bold">
                  {
                    users.filter((u) => {
                      if (!u.last_scan) return false;
                      const today = new Date();
                      const scanDate = new Date(u.last_scan);
                      return scanDate.toDateString() === today.toDateString();
                    }).length
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-2">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[200px]">User</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="text-center">Scans</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Scan</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">No users found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.user_id} className="hover:bg-secondary/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                              user.role === "admin" 
                                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white" 
                                : "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground"
                            }`}>
                              {getInitials(user.full_name, user.user_id)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {user.full_name || "Unnamed User"}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {user.user_id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.phone ? (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">No phone</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-bold">
                            {user.scan_count}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {formatDate(user.last_scan)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: "admin" | "user") =>
                              handleRoleChange(user.user_id, value)
                            }
                          >
                            <SelectTrigger className={`w-24 md:w-28 h-8 text-xs ${
                              user.role === "admin" ? "border-amber-500/50 text-amber-600" : ""
                            }`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <User className="h-3.5 w-3.5" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;