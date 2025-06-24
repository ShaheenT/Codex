import { Home, Search, Camera, ClipboardList, User } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import ProfileModal from "./profile-modal";

interface BottomNavProps {
  onCreatePost: () => void;
  onSearch: () => void;
}

export default function BottomNav({ onCreatePost, onSearch }: BottomNavProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            <Link href="/">
              <button className="p-3 text-gray-900 hover:text-pink-600 transition-colors">
                <Home className="w-6 h-6" />
              </button>
            </Link>
            <button 
              onClick={onSearch}
              className="p-3 text-gray-500 hover:text-pink-600 transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={onCreatePost}
              className="p-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors shadow-lg"
              title="Snap a special"
            >
              <Camera className="w-6 h-6" />
            </button>
            <Link href="/shopping-lists">
              <button className="p-3 text-gray-500 hover:text-pink-600 transition-colors">
                <ClipboardList className="w-6 h-6" />
              </button>
            </Link>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="p-3 text-gray-500 hover:text-pink-600 transition-colors"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
