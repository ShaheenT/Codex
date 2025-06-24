import { useState } from "react";
import { X, Camera, Share2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDealSchema } from "@shared/schema";
import { z } from "zod";
import type { Store, Category } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const postFormSchema = z.object({
  title: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  categoryId: z.number().min(1, "Please select a category"),
  salePrice: z.string().min(1, "Product price is required"),
  storeId: z.number().min(1, "Please select a store"),
  imageUrl: z.string().min(1, "Please add a product image"),
  userId: z.string().min(1, "User ID is required"),
  comment: z.string().optional(),
  originalPrice: z.string().optional(),
  discountPercent: z.number().optional(),
  expiresAt: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function PostModal({ isOpen, onClose, onPostCreated }: PostModalProps) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();

  const { data: stores } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      description: "",
      salePrice: "",
      imageUrl: "",
      storeId: 0,
      categoryId: 0,
      userId: "user123", // In real app, get from auth
      comment: "",
      originalPrice: "",
      discountPercent: 0,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/upload", {});
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("imageUrl", data.imageUrl);
      setImagePreview(data.imageUrl);
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      // Calculate discount percentage if both prices provided
      let discountPercent = data.discountPercent || 0;
      if (data.originalPrice && data.salePrice) {
        const original = parseFloat(data.originalPrice.replace(/[^0-9.]/g, ""));
        const sale = parseFloat(data.salePrice.replace(/[^0-9.]/g, ""));
        if (original > 0 && sale > 0) {
          discountPercent = Math.round(((original - sale) / original) * 100);
        }
      }

      // Combine description and comment
      const fullDescription = data.comment 
        ? `${data.description}\n\n💬 ${data.comment}`
        : data.description;

      const dealData = {
        ...data,
        description: fullDescription,
        discountPercent,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      };

      const response = await apiRequest("POST", "/api/deals", dealData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your deal has been posted.",
      });
      onPostCreated();
      form.reset();
      setImagePreview("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = () => {
    uploadMutation.mutate();
  };

  const onSubmit = (data: PostFormValues) => {
    if (!data.imageUrl) {
      toast({
        title: "Missing Image",
        description: "Please add an image for your deal.",
        variant: "destructive",
      });
      return;
    }
    createDealMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setImagePreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share a Special</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Photo
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      form.setValue("imageUrl", "");
                    }}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-600 transition-colors cursor-pointer"
                >
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    {uploadMutation.isPending ? "Uploading..." : "Snap your product photo"}
                  </p>
                  <p className="text-sm text-gray-500">Show off that special deal!</p>
                </button>
              )}
            </div>

            {/* Product Name */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Organic Bananas, Milk, Bread..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Category</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the product and what makes this deal special..."
                      className="h-20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Price */}
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Price</FormLabel>
                  <FormControl>
                    <Input placeholder="$2.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Store Name */}
            <FormField
              control={form.control}
              name="storeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stores?.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name} - {store.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment Section */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add your thoughts about this deal, tips, or recommendations..."
                      className="h-16 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Options - Collapsible */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 py-2">
                Additional Options (Optional)
              </summary>
              <div className="space-y-3 mt-2 pl-4 border-l-2 border-gray-200">
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (if on sale)</FormLabel>
                      <FormControl>
                        <Input placeholder="$4.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Expires</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </details>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDealMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {createDealMutation.isPending ? "Sharing..." : "Share Special"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
