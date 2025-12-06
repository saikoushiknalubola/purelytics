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
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserData {
  user_id: string;
  email: string;
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

      // Get unique user IDs from both products and roles
      const allUserIds = new Set([
        ...userStatsMap.keys(),
        ...rolesMap.keys(),
      ]);

      // Build user data array
      const userData: UserData[] = Array.from(allUserIds).map((userId) => {
        const stats = userStatsMap.get(userId);
        return {
          user_id: userId,
          email: `User ${userId.substring(0, 8)}...`,
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

  const filteredUsers = users.filter(
    (user) =>
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">User Management</h1>
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
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
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
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ScanLine className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Scans</p>
                <p className="text-xl font-bold">
                  {users.reduce((acc, u) => acc + u.scan_count, 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">User ID</TableHead>
                    <TableHead className="text-center">Scans</TableHead>
                    <TableHead className="hidden md:table-cell">Last Scan</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-muted rounded-full">
                              {user.role === "admin" ? (
                                <Shield className="h-3.5 w-3.5 text-amber-500" />
                              ) : (
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-mono text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                              {user.user_id.substring(0, 8)}...
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{user.scan_count}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
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
                            <SelectTrigger className="w-24 md:w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
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
