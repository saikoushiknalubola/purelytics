import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Search, Pencil, Trash2, Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Ingredient {
  id: string;
  name: string;
  hazard_score: number;
  hazard_type: string;
  description: string | null;
  source: string | null;
  regulatory_flag: string | null;
  alternatives: string | null;
}

const AdminIngredients = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    hazard_score: 1,
    hazard_type: "",
    description: "",
    source: "",
    regulatory_flag: "",
    alternatives: ""
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredIngredients(ingredients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = ingredients.filter(ing => 
        ing.name.toLowerCase().includes(query) ||
        ing.hazard_type.toLowerCase().includes(query) ||
        ing.description?.toLowerCase().includes(query)
      );
      setFilteredIngredients(filtered);
    }
  }, [searchQuery, ingredients]);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data || []);
      setFilteredIngredients(data || []);
    } catch (error) {
      console.error("Error loading ingredients:", error);
      toast.error("Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        name: ingredient.name,
        hazard_score: ingredient.hazard_score,
        hazard_type: ingredient.hazard_type,
        description: ingredient.description || "",
        source: ingredient.source || "",
        regulatory_flag: ingredient.regulatory_flag || "",
        alternatives: ingredient.alternatives || ""
      });
    } else {
      setEditingIngredient(null);
      setFormData({
        name: "",
        hazard_score: 1,
        hazard_type: "",
        description: "",
        source: "",
        regulatory_flag: "",
        alternatives: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.hazard_type.trim()) {
        toast.error("Name and hazard type are required");
        return;
      }

      if (formData.hazard_score < 1 || formData.hazard_score > 5) {
        toast.error("Hazard score must be between 1 and 5");
        return;
      }

      const ingredientData = {
        name: formData.name.trim(),
        hazard_score: formData.hazard_score,
        hazard_type: formData.hazard_type.trim(),
        description: formData.description.trim() || null,
        source: formData.source.trim() || null,
        regulatory_flag: formData.regulatory_flag.trim() || null,
        alternatives: formData.alternatives.trim() || null
      };

      if (editingIngredient) {
        // Update existing
        const { error } = await supabase
          .from('ingredients')
          .update(ingredientData)
          .eq('id', editingIngredient.id);

        if (error) throw error;
        toast.success("Ingredient updated successfully");
      } else {
        // Create new
        const { error } = await supabase
          .from('ingredients')
          .insert([ingredientData]);

        if (error) throw error;
        toast.success("Ingredient added successfully");
      }

      setIsDialogOpen(false);
      loadIngredients();
    } catch (error: any) {
      console.error("Error saving ingredient:", error);
      toast.error(error.message || "Failed to save ingredient");
    }
  };

  const handleDelete = async () => {
    if (!deletingIngredient) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', deletingIngredient.id);

      if (error) throw error;
      
      toast.success("Ingredient deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingIngredient(null);
      loadIngredients();
    } catch (error: any) {
      console.error("Error deleting ingredient:", error);
      toast.error(error.message || "Failed to delete ingredient");
    }
  };

  const getHazardColor = (score: number) => {
    if (score >= 4) return "destructive";
    if (score >= 3) return "default";
    return "secondary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-lg p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/admin")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Ingredient Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Ingredient
            </Button>
          </div>

          <div className="rounded-lg border bg-card">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Hazard Score</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {searchQuery ? "No ingredients found matching your search" : "No ingredients in database"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIngredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                        <TableCell>{ingredient.hazard_type}</TableCell>
                        <TableCell>
                          <Badge variant={getHazardColor(ingredient.hazard_score)}>
                            {ingredient.hazard_score}/5
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {ingredient.description || <span className="text-muted-foreground italic">No description</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(ingredient)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingIngredient(ingredient);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIngredient ? "Edit Ingredient" : "Add New Ingredient"}</DialogTitle>
            <DialogDescription>
              {editingIngredient ? "Update the ingredient details below" : "Enter the details for the new ingredient"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Methylparaben"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hazard_type">Hazard Type *</Label>
              <Input
                id="hazard_type"
                value={formData.hazard_type}
                onChange={(e) => setFormData({ ...formData, hazard_type: e.target.value })}
                placeholder="e.g., Preservative, Colorant"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hazard_score">Hazard Score (1-5) *</Label>
              <Input
                id="hazard_score"
                type="number"
                min="1"
                max="5"
                value={formData.hazard_score}
                onChange={(e) => setFormData({ ...formData, hazard_score: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the health concerns and effects"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., FDA Reports, EWG Database"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="regulatory_flag">Regulatory Flag</Label>
              <Input
                id="regulatory_flag"
                value={formData.regulatory_flag}
                onChange={(e) => setFormData({ ...formData, regulatory_flag: e.target.value })}
                placeholder="e.g., Banned in EU"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alternatives">Alternatives</Label>
              <Textarea
                id="alternatives"
                value={formData.alternatives}
                onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
                placeholder="Safer alternative ingredients"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingIngredient ? "Update" : "Add"} Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ingredient?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingIngredient?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingIngredient(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminIngredients;
