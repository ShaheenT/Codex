import { useState } from "react";
import { Search, Users, Store, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"users" | "stores" | null>(null);

  const handleSearch = (type: "users" | "stores") => {
    setSearchType(type);
  };

  const resetSearch = () => {
    setSearchType(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!searchType ? (
            // Search type selection
            <div className="space-y-3">
              <p className="text-sm text-gray-600">What would you like to search for?</p>
              
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => handleSearch("users")}
                  variant="outline"
                  className="flex items-center space-x-3 p-4 h-auto justify-start"
                >
                  <Users className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Find Users</p>
                    <p className="text-sm text-gray-500">Search for friends and family</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleSearch("stores")}
                  variant="outline"
                  className="flex items-center space-x-3 p-4 h-auto justify-start"
                >
                  <Store className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Find Stores</p>
                    <p className="text-sm text-gray-500">Search for retail stores and locations</p>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            // Search interface
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {searchType === "users" ? "Search Users" : "Search Stores"}
                </h3>
                <Button onClick={resetSearch} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Input
                placeholder={
                  searchType === "users" 
                    ? "Enter username or name..." 
                    : "Enter store name or location..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />

              <div className="text-center py-8 text-gray-500">
                {searchQuery ? (
                  <div>
                    <p>No {searchType} found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">
                      {searchType === "users" ? "👥" : "🏪"}
                    </div>
                    <p>Start typing to search for {searchType}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}