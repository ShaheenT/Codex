import { useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Wallet, 
  LogOut, 
  Edit3,
  Check,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ThemeMode = "light" | "dark" | "auto";

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  
  // Mock user data - in real app, this would come from auth context
  const [userProfile, setUserProfile] = useState({
    fullName: "John Smith",
    surname: "Smith",
    email: "john.smith@email.com",
    username: "johnsmith23",
    tokens: 1250,
    rewards: 85
  });

  const [editedProfile, setEditedProfile] = useState(userProfile);

  const handleSaveProfile = () => {
    setUserProfile(editedProfile);
    setIsEditing(false);
    // In real app, would save to backend
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    // In real app, would clear auth state and redirect
    console.log("Logging out...");
    onClose();
  };

  const handlePasswordReset = () => {
    // In real app, would trigger password reset flow
    alert("Password reset email sent to " + userProfile.email);
  };

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case "light": return <Sun className="w-4 h-4" />;
      case "dark": return <Moon className="w-4 h-4" />;
      case "auto": return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar & Basic Info */}
          <div className="text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-10 h-10 text-pink-600" />
            </div>
            {!isEditing ? (
              <div>
                <h3 className="text-lg font-semibold">{userProfile.fullName}</h3>
                <p className="text-gray-500 text-sm">@{userProfile.username}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={editedProfile.fullName}
                  onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                  placeholder="Full name"
                  className="text-center"
                />
                <Input
                  value={editedProfile.username}
                  onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                  placeholder="Username"
                  className="text-center"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Profile Information</h4>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                  <Edit3 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} variant="ghost" size="sm">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                {!isEditing ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{userProfile.email}</span>
                  </div>
                ) : (
                  <Input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="mt-1"
                  />
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Username (Optional)</Label>
                {!isEditing ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">@{userProfile.username}</span>
                  </div>
                ) : (
                  <Input
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                    className="mt-1"
                    placeholder="Username"
                  />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ishopp Wallet */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Ishopp Wallet</span>
            </h4>
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{userProfile.tokens}</div>
                  <div className="text-sm text-gray-600">Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userProfile.rewards}</div>
                  <div className="text-sm text-gray-600">Rewards</div>
                </div>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  View Wallet Details
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </h4>

            {/* Theme Mode */}
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <div className="flex space-x-2 mt-2">
                {(["light", "dark", "auto"] as ThemeMode[]).map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => setThemeMode(mode)}
                    variant={themeMode === mode ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    {getThemeIcon(mode)}
                    <span className="ml-2 capitalize">{mode}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="text-sm font-medium">Password</Label>
              <Button 
                onClick={handlePasswordReset}
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
              >
                <Lock className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
            </div>
          </div>

          <Separator />

          {/* Logout */}
          <div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}