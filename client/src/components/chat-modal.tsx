import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, X, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, UserProfile } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimeAgo } from "@/lib/utils";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: UserProfile | null;
  dealId?: number;
}

export default function ChatModal({ isOpen, onClose, selectedUser, dealId }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = "user123"; // In real app, get from auth

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-messages", { user1: currentUserId, user2: selectedUser?.username }],
    enabled: isOpen && !!selectedUser,
    refetchInterval: 2000, // Poll for new messages every 2 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat-messages", {
        fromUserId: currentUserId,
        toUserId: selectedUser?.username,
        content,
        dealId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages"] });
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-3">
            <img
              src={selectedUser.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
              alt={selectedUser.displayName || selectedUser.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">
                {selectedUser.displayName || selectedUser.username}
              </h3>
              <p className="text-sm text-gray-500">@{selectedUser.username}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.fromUserId === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    msg.fromUserId === currentUserId
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.fromUserId === currentUserId
                        ? "text-pink-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTimeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Start a conversation about this special!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Deal Reference */}
        {dealId && (
          <div className="flex-shrink-0 bg-gray-50 rounded-lg p-3 mx-1">
            <p className="text-xs text-gray-600 mb-1">Discussing:</p>
            <p className="text-sm font-medium">Special Deal #{dealId}</p>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex-shrink-0 flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}