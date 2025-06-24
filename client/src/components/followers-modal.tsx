import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, MessageSquare, Share2, X } from "lucide-react";
import type { UserProfile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "share" | "chat";
  onSelectUser?: (user: UserProfile) => void;
  dealId?: number;
}

export default function FollowersModal({ 
  isOpen, 
  onClose, 
  mode, 
  onSelectUser,
  dealId 
}: FollowersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const userId = "user123"; // In real app, get from auth

  const { data: followers } = useQuery<UserProfile[]>({
    queryKey: ["/api/followers", { userId }],
    enabled: isOpen,
  });

  const filteredFollowers = followers?.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: UserProfile) => {
    if (mode === "chat") {
      onSelectUser?.(user);
      onClose();
    } else {
      // Share mode - allow multiple selection
      const newSelected = new Set(selectedUsers);
      if (newSelected.has(user.username)) {
        newSelected.delete(user.username);
      } else {
        newSelected.add(user.username);
      }
      setSelectedUsers(newSelected);
    }
  };

  const handleShare = () => {
    // In real app, would send live special notifications to help friends save
    console.log("Sharing live special with users:", Array.from(selectedUsers));
    // Show success message
    alert(`Live special shared with ${selectedUsers.size} friends! They'll be notified about this saving opportunity.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {mode === "share" ? <Share2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            <span>{mode === "share" ? "Share Live Special" : "Chat About Deal"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search */}
          <Input
            placeholder="Search followers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Followers List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredFollowers?.map((user) => (
              <div
                key={user.username}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUsers.has(user.username)
                    ? "bg-pink-50 border border-pink-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                  alt={user.displayName || user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 truncate">
                      {user.displayName || user.username}
                    </p>
                    {selectedUsers.has(user.username) && (
                      <Badge variant="secondary" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    @{user.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.followersCount} followers
                  </p>
                </div>
                {mode === "chat" && (
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                )}
              </div>
            ))}

            {filteredFollowers?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No followers found</p>
                {searchTerm && (
                  <p className="text-sm">Try a different search term</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {mode === "share" && selectedUsers.size > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedUsers.size} selected
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleShare} className="bg-pink-600 hover:bg-pink-700">
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}