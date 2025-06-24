import { useState } from "react";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DealWithStore, UserProfile } from "@shared/schema";
import { formatTimeAgo, formatExpirationTime, formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSwipe } from "@/hooks/use-swipe";
import FollowersModal from "./followers-modal";
import ChatModal from "./chat-modal";
import LiveIndicator from "./live-indicator";
import SwipeFeedback from "./swipe-feedback";

interface DealPostProps {
  deal: DealWithStore;
  userId: string;
}

export default function DealPost({ deal, userId }: DealPostProps) {
  const [isLiked, setIsLiked] = useState(deal.isLiked || false);
  const [likesCount, setLikesCount] = useState(deal.likes || 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(null);
  const [swipeAction, setSwipeAction] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/deals/${deal.id}/like`, { userId });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      setLikesCount(data.likes);
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleLocationClick = () => {
    if (deal.store.latitude && deal.store.longitude) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${deal.store.latitude},${deal.store.longitude}`;
      window.open(googleMapsUrl, '_blank');
    } else if (deal.store.address) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deal.store.address)}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      toast({
        title: "Location unavailable",
        description: "Store location information is not available",
        variant: "destructive",
      });
    }
  };

  const handleChatUser = (user: UserProfile) => {
    setSelectedChatUser(user);
    setIsChatModalOpen(true);
  };

  // Swipe handlers
  const handleSwipeLeft = () => {
    setSwipeAction("share");
    setIsShareModalOpen(true);
    setTimeout(() => setSwipeAction(null), 300);
  };

  const handleSwipeRight = () => {
    setSwipeAction("like");
    handleLike();
    setTimeout(() => setSwipeAction(null), 300);
  };

  const handleSwipeUp = () => {
    setSwipeAction("bookmark");
    toast({
      title: "Bookmarked!",
      description: "Special saved to your bookmarks",
    });
    setTimeout(() => setSwipeAction(null), 300);
  };

  const swipeRef = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: handleSwipeUp,
    threshold: 75,
  });

  const getDiscountBadge = () => {
    if (deal.discountPercent) {
      return `${deal.discountPercent}% OFF`;
    }
    if (deal.originalPrice && deal.salePrice) {
      return "SALE";
    }
    return "SPECIAL";
  };

  const getBadgeColor = () => {
    if (deal.discountPercent && deal.discountPercent >= 50) {
      return "bg-pink-600";
    }
    if (deal.discountPercent && deal.discountPercent >= 30) {
      return "bg-orange-500";
    }
    return "bg-blue-600";
  };

  return (
    <article 
      ref={swipeRef}
      className={`bg-white border-b border-gray-200 transition-transform duration-300 ${
        swipeAction === "like" ? "scale-105" : 
        swipeAction === "share" ? "-translate-x-2" : 
        swipeAction === "bookmark" ? "-translate-y-2" : ""
      }`}
    >
      {/* User Profile Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-3">
          <img
            src={deal.user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
            alt={deal.user?.displayName || deal.user?.username || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {deal.user?.displayName || deal.user?.username || "Anonymous"}
            </h3>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(deal.createdAt)}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Deal Image */}
      <div className="relative">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="w-full h-80 object-cover"
        />
        
        {/* Live Indicator */}
        <div className="absolute top-4 left-4">
          <LiveIndicator />
        </div>

        {/* Discount Badge */}
        {deal.discountPercent && (
          <div className={`absolute top-12 left-4 px-3 py-1 rounded-full text-white text-sm font-bold ${getDiscountBadge()}`}>
            {deal.discountPercent}% OFF
          </div>
        )}
        
        {/* Action Icons Overlay */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          <button
            onClick={handleLike}
            className={`p-3 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white/90 hover:scale-110 ${
              isLiked ? "text-red-500" : "text-gray-700"
            }`}
            disabled={likeMutation.isPending}
          >
            <Heart
              className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
            />
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-3 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white/90 hover:scale-110 text-gray-700"
            title="Chat about this deal"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-3 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white/90 hover:scale-110 text-gray-700"
            title="Share this special"
          >
            <Share className="w-6 h-6" />
          </button>
          <button 
            onClick={handleSwipeUp}
            className="p-3 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white/90 hover:scale-110 text-gray-700"
          >
            <Bookmark className="w-6 h-6" />
          </button>
        </div>
        
        {/* Price Display */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            {deal.originalPrice && (
              <span className="text-sm line-through text-gray-300">
                {formatPrice(deal.originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold">
              {formatPrice(deal.salePrice)}
            </span>
          </div>
          {deal.expiresAt && (
            <p className="text-xs text-gray-300 mt-1">
              Expires {formatExpirationTime(deal.expiresAt)}
            </p>
          )}
        </div>
      </div>

      {/* Store Information */}
      <div className="px-4 pb-3">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
          <img
            src={deal.store.logoUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=24&h=24&fit=crop"}
            alt={deal.store.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{deal.store.name}</p>
            <p className="text-xs text-gray-500 truncate">{deal.store.location}</p>
          </div>
          <button 
            onClick={handleLocationClick}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Get directions"
          >
            <MapPin className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-0">
        {/* Likes count */}
        <div className="mb-4">&nbsp;</div>

        <div className="space-y-2">
          <p className="font-semibold text-sm">
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </p>
          <div>
            <span className="font-semibold text-gray-900">
              {deal.user?.username || "anonymous"}
            </span>
            <span className="text-gray-900 ml-2">{deal.description}</span>
          </div>
          
          {/* Savings Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
            <p className="text-sm text-green-800">
              💰 <strong>{deal.user?.displayName || deal.user?.username}</strong> is helping you save{" "}
              {deal.discountPercent && <span className="font-semibold">{deal.discountPercent}%</span>}{" "}
              at {deal.store.name}!
            </p>
          </div>
          
          {/* Follower Avatars */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {/* Sample follower avatars - in real app would fetch from API */}
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" 
                alt="Follower" 
                className="w-6 h-6 rounded-full border-2 border-white"
              />
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" 
                alt="Follower" 
                className="w-6 h-6 rounded-full border-2 border-white"
              />
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" 
                alt="Follower" 
                className="w-6 h-6 rounded-full border-2 border-white"
              />
            </div>
            <span className="text-xs text-gray-500">
              Liked by your followers
            </span>
          </div>
          
          <p className="text-gray-500 text-sm cursor-pointer hover:text-gray-600">
            View all comments
          </p>
        </div>
      </div>

      {/* Followers Modal for both share and chat */}
      <FollowersModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        mode="chat"
        onSelectUser={handleChatUser}
        dealId={deal.id}
      />

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setSelectedChatUser(null);
        }}
        selectedUser={selectedChatUser}
        dealId={deal.id}
      />
    </article>
  );
}
