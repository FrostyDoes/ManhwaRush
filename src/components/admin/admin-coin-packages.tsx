"use client";

import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, Plus, Edit, Trash, Loader2 } from "lucide-react";

interface CoinPackage {
  id: string;
  name: string;
  description: string;
  coins: number;
  price: number;
  stripe_price_id: string;
  is_active: boolean;
  created_at: string;
}

interface AdminCoinPackagesProps {
  initialPackages: CoinPackage[];
}

export function AdminCoinPackages({ initialPackages }: AdminCoinPackagesProps) {
  const [packages, setPackages] = useState<CoinPackage[]>(initialPackages);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coins: 0,
    price: 0,
    stripe_price_id: "",
    is_active: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddPackage = async () => {
    setIsLoading(true);
    try {
      // Validate form data
      if (
        !formData.name ||
        !formData.coins ||
        !formData.price ||
        !formData.stripe_price_id
      ) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/coin-packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create package");
      }

      // Add the new package to the list
      setPackages([...packages, data.package]);
      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Package Created",
        description: "Coin package has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create package",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPackage = async () => {
    if (!selectedPackage) return;

    setIsLoading(true);
    try {
      // Validate form data
      if (
        !formData.name ||
        !formData.coins ||
        !formData.price ||
        !formData.stripe_price_id
      ) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `/api/admin/coin-packages?id=${selectedPackage.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update package");
      }

      // Update the package in the list
      setPackages(
        packages.map((pkg) =>
          pkg.id === selectedPackage.id ? data.package : pkg,
        ),
      );
      setIsEditDialogOpen(false);
      resetForm();

      toast({
        title: "Package Updated",
        description: "Coin package has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/coin-packages?id=${selectedPackage.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete package");
      }

      // Remove the package from the list
      setPackages(packages.filter((pkg) => pkg.id !== selectedPackage.id));
      setIsDeleteDialogOpen(false);

      toast({
        title: "Package Deleted",
        description: "Coin package has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || "",
      coins: pkg.coins,
      price: pkg.price,
      stripe_price_id: pkg.stripe_price_id,
      is_active: pkg.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      coins: 0,
      price: 0,
      stripe_price_id: "",
      is_active: true,
    });
    setSelectedPackage(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100); // Assuming price is stored in cents
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Coin Packages</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stripe Price ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No coin packages found
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {pkg.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{pkg.coins}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(pkg.price)}</TableCell>
                  <TableCell>
                    <div
                      className={`px-2 py-1 rounded-full text-xs w-fit ${pkg.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
                    >
                      {pkg.is_active ? "Active" : "Inactive"}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {pkg.stripe_price_id}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(pkg)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Package Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Coin Package</DialogTitle>
            <DialogDescription>
              Create a new coin package for users to purchase
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., Basic Pack"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="description"
                className="text-right text-sm font-medium"
              >
                Description
              </label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., Best value for new readers"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="coins" className="text-right text-sm font-medium">
                Coins
              </label>
              <Input
                id="coins"
                name="coins"
                type="number"
                value={formData.coins}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., 100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right text-sm font-medium">
                Price (cents)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., 999 (for $9.99)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="stripe_price_id"
                className="text-right text-sm font-medium"
              >
                Stripe Price ID
              </label>
              <Input
                id="stripe_price_id"
                name="stripe_price_id"
                value={formData.stripe_price_id}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g., price_1234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="is_active"
                className="text-right text-sm font-medium"
              >
                Active
              </label>
              <div className="col-span-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm">
                  Package is available for purchase
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPackage} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coin Package</DialogTitle>
            <DialogDescription>
              Update the details of this coin package
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="edit-name"
                className="text-right text-sm font-medium"
              >
                Name
              </label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="edit-description"
                className="text-right text-sm font-medium"
              >
                Description
              </label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="edit-coins"
                className="text-right text-sm font-medium"
              >
                Coins
              </label>
              <Input
                id="edit-coins"
                name="coins"
                type="number"
                value={formData.coins}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="edit-price"
                className="text-right text-sm font-medium"
              >
                Price (cents)
              </label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="edit-stripe_price_id"
                className="text-right text-sm font-medium"
              >
                Stripe Price ID
              </label>
              <Input
                id="edit-stripe_price_id"
                name="stripe_price_id"
                value={formData.stripe_price_id}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="edit-is_active"
                className="text-right text-sm font-medium"
              >
                Active
              </label>
              <div className="col-span-3">
                <input
                  type="checkbox"
                  id="edit-is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="edit-is_active" className="text-sm">
                  Package is available for purchase
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditPackage} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Package Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coin Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coin package? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedPackage && (
              <div className="bg-muted p-4 rounded-md">
                <div className="font-medium">{selectedPackage.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedPackage.description}
                </div>
                <div className="mt-2 flex items-center">
                  <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{selectedPackage.coins} coins</span>
                  <span className="mx-2">•</span>
                  <span>{formatPrice(selectedPackage.price)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePackage}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
