import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart, Users, Check, X, Edit2, Trash2, ScanLine } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ShoppingListWithItems, ShoppingListItem } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function ShoppingLists() {
  const [userId] = useState("user123");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ShoppingListWithItems | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState("");
  const [shareUserId, setShareUserId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shoppingLists, isLoading } = useQuery<ShoppingListWithItems[]>({
    queryKey: ["/api/shopping-lists", { userId }],
  });

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/shopping-lists", {
        name,
        userId,
        isShared: false,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      setIsCreateModalOpen(false);
      setNewListName("");
      toast({ title: "Success", description: "Shopping list created!" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: { name: string; quantity: number; price?: string }) => {
      const response = await apiRequest("POST", `/api/shopping-lists/${selectedList?.id}/items`, item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
      setIsAddItemModalOpen(false);
      setNewItemName("");
      setNewItemQuantity(1);
      setNewItemPrice("");
      toast({ title: "Success", description: "Item added to list!" });
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: number; completed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/shopping-list-items/${itemId}`, {
        isCompleted: completed,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
    },
  });

  const shareListMutation = useMutation({
    mutationFn: async ({ listId, sharedWith }: { listId: number; sharedWith: string }) => {
      const response = await apiRequest("POST", `/api/shopping-lists/${listId}/share`, {
        sharedWithUserId: sharedWith,
        canEdit: true,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "List shared successfully!" });
      setShareUserId("");
    },
  });

  const handleScanBarcode = () => {
    // Simulate barcode scanning - in real app would use camera API
    const mockBarcodes = [
      { code: "123456789", name: "Organic Bananas", price: "$2.99" },
      { code: "987654321", name: "Whole Milk", price: "$3.49" },
      { code: "456789123", name: "Bread Loaf", price: "$2.29" },
    ];
    
    const scannedItem = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    setNewItemName(scannedItem.name);
    setNewItemPrice(scannedItem.price);
    setIsScanModalOpen(false);
    setIsAddItemModalOpen(true);
    
    toast({ 
      title: "Item Scanned", 
      description: `Found: ${scannedItem.name}` 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your lists...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="text-2xl text-pink-600" />
            <h1 className="text-xl font-bold text-gray-900">Shopping Lists</h1>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New List
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setIsScanModalOpen(true)}
              variant="outline"
              className="flex-1"
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Scan & Add
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline"
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              New List
            </Button>
          </div>
        </div>

        {/* Shopping Lists */}
        {shoppingLists && shoppingLists.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {shoppingLists.map((list) => (
              <div key={list.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{list.name}</h3>
                  <div className="flex items-center space-x-2">
                    {list.isShared && (
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        Shared
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {list.itemCount} items
                    </Badge>
                  </div>
                </div>

                {/* List Items Preview */}
                <div className="space-y-2 mb-4">
                  {list.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={(checked) =>
                          toggleItemMutation.mutate({
                            itemId: item.id,
                            completed: Boolean(checked),
                          })
                        }
                      />
                      <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {item.name}
                      </span>
                      {item.price && (
                        <span className="text-xs text-green-600 ml-auto">{item.price}</span>
                      )}
                    </div>
                  ))}
                  {list.items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{list.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* List Actions */}
                <div className="flex justify-between">
                  <Button
                    onClick={() => setSelectedList(list)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setSelectedList(list);
                        setIsAddItemModalOpen(true);
                      }}
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shopping lists yet</h3>
            <p className="text-gray-600 mb-6">Create your first list to get started</p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Create Your First List
            </Button>
          </div>
        )}
      </main>

      {/* Create List Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shopping List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">List Name</label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Weekly Groceries"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createListMutation.mutate(newListName)}
                disabled={!newListName.trim() || createListMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Create List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to {selectedList?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Item Name</label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Milk"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <Input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price (optional)</label>
                <Input
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="$0.00"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => addItemMutation.mutate({
                  name: newItemName,
                  quantity: newItemQuantity,
                  price: newItemPrice || undefined,
                })}
                disabled={!newItemName.trim() || addItemMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Modal */}
      <Dialog open={isScanModalOpen} onOpenChange={setIsScanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Product Barcode</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 space-y-4">
            <ScanLine className="w-16 h-16 text-pink-600 mx-auto" />
            <p className="text-gray-600">Position the barcode within the camera frame</p>
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
              Demo Mode: Click "Scan Now" to simulate scanning
            </div>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => setIsScanModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScanBarcode}
                className="bg-pink-600 hover:bg-pink-700"
              >
                Scan Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}