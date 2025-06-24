import { ShoppingCart, Search, Heart, User } from "lucide-react";
import { useState } from "react";
import ProfileModal from "./profile-modal";

export default function Header() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="text-2xl text-pink-600" />
            <h1 className="text-xl font-bold text-gray-900">Ishopp</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <User className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
