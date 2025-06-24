import { useState, useEffect } from "react";
import Header from "@/components/header";
import CategoryStories from "@/components/category-stories";
import DealPost from "@/components/deal-post";
import BottomNav from "@/components/bottom-nav";
import PostModal from "@/components/post-modal";
import SearchModal from "@/components/search-modal";
import SwipeTutorial from "@/components/swipe-tutorial";
import { useQuery } from "@tanstack/react-query";
import type { DealWithStore } from "@shared/schema";

export default function Home() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [userId] = useState("user123"); // In a real app, this would come from auth

  const { data: deals, isLoading, refetch } = useQuery<DealWithStore[]>({
    queryKey: ["/api/deals", { userId }],
    refetchInterval: 30000, // Refetch every 30 seconds for fresh data
  });

  // Check if tutorial should be shown on first visit
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('ishoppTutorialCompleted');
    if (!tutorialCompleted) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setIsTutorialOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handlePostCreated = () => {
    refetch();
    setIsPostModalOpen(false);
  };

  const handleTutorialClose = () => {
    setIsTutorialOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryStories />
      
      <main className="max-w-4xl mx-auto pb-20">
        {deals && deals.length > 0 ? (
          <div className="space-y-0">
            {deals.map((deal) => (
              <DealPost key={deal.id} deal={deal} userId={userId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deals yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share a great deal!</p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors"
            >
              Share Your First Deal
            </button>
          </div>
        )}
      </main>

      <BottomNav 
        onCreatePost={() => setIsPostModalOpen(true)}
        onSearch={() => setIsSearchModalOpen(true)}
      />
      
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <SwipeTutorial
        isOpen={isTutorialOpen}
        onClose={handleTutorialClose}
      />
    </div>
  );
}
