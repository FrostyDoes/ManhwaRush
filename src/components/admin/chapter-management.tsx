"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Coins,
  Edit,
  Search,
  Trash2,
  Plus,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@supabase/supabase-js";

// Client-side admin functions
const getAllManhwa = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    const { data, error } = await supabase
      .from("manhwa")
      .select("*")
      .order("title", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching manhwa:", error);
    return [];
  }
};

const getManhwaChapters = async (manhwaId: string) => {
  if (!manhwaId) return [];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("manhwa_id", manhwaId)
      .order("number", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
};

const updateChapter = async (chapterId: string, data: any) => {
  if (!chapterId) {
    return { success: false, error: "Missing chapter ID" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    const { error } = await supabase
      .from("chapters")
      .update(data)
      .eq("id", chapterId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating chapter:", error);
    return { success: false, error: error.message };
  }
};

const createChapter = async (data: any) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    const { error } = await supabase.from("chapters").insert(data);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error creating chapter:", error);
    return { success: false, error: error.message };
  }
};

const deleteChapter = async (chapterId: string) => {
  if (!chapterId) {
    return { success: false, error: "Missing chapter ID" };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    // First delete any reading history for this chapter
    await supabase.from("reading_history").delete().eq("chapter_id", chapterId);

    // Then delete any purchases for this chapter
    await supabase
      .from("user_chapter_purchases")
      .delete()
      .eq("chapter_id", chapterId);

    // Finally delete the chapter itself
    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting chapter:", error);
    return { success: false, error: error.message };
  }
};

export function AdminChapterManagement() {
  const [manhwaList, setManhwaList] = useState<any[]>([]);
  const [selectedManhwaId, setSelectedManhwaId] = useState<string>("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [chapterToDelete, setChapterToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    number: 1,
    is_premium: false,
    coin_price: 3,
  });

  const { toast } = useToast();

  // Fetch all manhwa on component mount
  useEffect(() => {
    const fetchManhwa = async () => {
      const data = await getAllManhwa();
      setManhwaList(data);
      if (data.length > 0) {
        setSelectedManhwaId(data[0].id);
      }
    };

    fetchManhwa();
  }, []);

  // Fetch chapters when manhwa selection changes
  useEffect(() => {
    if (selectedManhwaId) {
      const fetchChapters = async () => {
        setIsLoading(true);
        const data = await getManhwaChapters(selectedManhwaId);
        setChapters(data);
        setIsLoading(false);
      };

      fetchChapters();
    }
  }, [selectedManhwaId]);

  // Filter chapters based on search term
  const filteredChapters = chapters.filter(
    (chapter) =>
      chapter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.number?.toString().includes(searchTerm),
  );

  const handleEditChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    setFormData({
      title: chapter.title || "",
      number: chapter.number || 1,
      is_premium: chapter.is_premium || false,
      coin_price: chapter.coin_price || 3,
    });
    setIsEditingChapter(true);
  };

  const handleAddChapter = () => {
    setFormData({
      title: `Chapter ${chapters.length + 1}`,
      number: chapters.length + 1,
      is_premium: false,
      coin_price: 3,
    });
    setIsAddingChapter(true);
  };

  const handleDeleteChapter = (chapter: any) => {
    setChapterToDelete(chapter);
  };

  const confirmDeleteChapter = async () => {
    if (!chapterToDelete) return;

    setIsLoading(true);
    try {
      const result = await deleteChapter(chapterToDelete.id);

      if (result.success) {
        toast({
          title: "Chapter Deleted",
          description: `Chapter ${chapterToDelete.number} has been deleted`,
        });
        // Remove the chapter from the local state
        setChapters(chapters.filter((c) => c.id !== chapterToDelete.id));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete chapter",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setChapterToDelete(null);
    }
  };

  const handleSaveChapter = async () => {
    if (!selectedManhwaId) return;

    setIsLoading(true);
    try {
      if (isEditingChapter && selectedChapter) {
        // Update existing chapter
        const result = await updateChapter(selectedChapter.id, {
          title: formData.title,
          number: formData.number,
          is_premium: formData.is_premium,
          coin_price: formData.is_premium ? formData.coin_price : 0,
        });

        if (result.success) {
          toast({
            title: "Chapter Updated",
            description: `Chapter ${formData.number} has been updated`,
          });
          // Update the chapter in the local state
          setChapters(
            chapters.map((c) =>
              c.id === selectedChapter.id
                ? {
                    ...c,
                    title: formData.title,
                    number: formData.number,
                    is_premium: formData.is_premium,
                    coin_price: formData.is_premium ? formData.coin_price : 0,
                  }
                : c,
            ),
          );
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update chapter",
            variant: "destructive",
          });
        }
      } else {
        // Create new chapter
        const newChapter = {
          manhwa_id: selectedManhwaId,
          title: formData.title,
          number: formData.number,
          is_premium: formData.is_premium,
          coin_price: formData.is_premium ? formData.coin_price : 0,
          id: `${selectedManhwaId}-ch-${formData.number}`,
          published_at: new Date().toISOString(),
        };

        const result = await createChapter(newChapter);

        if (result.success) {
          toast({
            title: "Chapter Created",
            description: `Chapter ${formData.number} has been created`,
          });
          // Add the new chapter to the local state
          setChapters([...chapters, newChapter]);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create chapter",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsEditingChapter(false);
      setIsAddingChapter(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-64">
          <Select value={selectedManhwaId} onValueChange={setSelectedManhwaId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a manhwa" />
            </SelectTrigger>
            <SelectContent>
              {manhwaList.map((manhwa) => (
                <SelectItem key={manhwa.id} value={manhwa.id}>
                  {manhwa.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search chapters..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={handleAddChapter}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading chapters...
                </TableCell>
              </TableRow>
            ) : filteredChapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No chapters found
                </TableCell>
              </TableRow>
            ) : (
              filteredChapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell className="font-medium">
                    {chapter.number}
                  </TableCell>
                  <TableCell>{chapter.title}</TableCell>
                  <TableCell>
                    {chapter.is_premium ? (
                      <Badge className="bg-amber-500">
                        <Coins className="h-3 w-3 mr-1" /> Premium
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <BookOpen className="h-3 w-3 mr-1" /> Free
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {chapter.is_premium ? (
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{chapter.coin_price || 0}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChapter(chapter)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteChapter(chapter)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete Chapter{" "}
                              {chapterToDelete?.number}? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDeleteChapter}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Add Chapter Dialog */}
      <Dialog
        open={isEditingChapter || isAddingChapter}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditingChapter(false);
            setIsAddingChapter(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingChapter ? "Edit Chapter" : "Add New Chapter"}
            </DialogTitle>
            <DialogDescription>
              {isEditingChapter
                ? `Edit details for Chapter ${selectedChapter?.number}`
                : `Add a new chapter to ${manhwaList.find((m) => m.id === selectedManhwaId)?.title}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="number" className="text-right">
                Number
              </Label>
              <Input
                id="number"
                type="number"
                value={formData.number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    number: parseInt(e.target.value) || 1,
                  })
                }
                className="col-span-3"
                min={1}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_premium" className="text-right">
                Premium
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_premium: checked })
                  }
                />
                <Label htmlFor="is_premium">
                  {formData.is_premium ? "Premium" : "Free"}
                </Label>
              </div>
            </div>
            {formData.is_premium && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coin_price" className="text-right">
                  Coin Price
                </Label>
                <div className="flex items-center col-span-3">
                  <Coins className="h-4 w-4 text-yellow-400 mr-2" />
                  <Input
                    id="coin_price"
                    type="number"
                    value={formData.coin_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coin_price: parseInt(e.target.value) || 0,
                      })
                    }
                    min={1}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingChapter(false);
                setIsAddingChapter(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveChapter} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
