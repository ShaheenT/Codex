import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string | null | undefined): string {
  if (!price) return "Price not available";
  
  // Remove any currency symbols and parse the number
  const numericValue = parseFloat(price.replace(/[^\d.]/g, ''));
  
  if (isNaN(numericValue)) return price;
  
  // Convert USD to ZAR (approximate rate: 1 USD = 18.5 ZAR)
  const zarValue = numericValue * 18.5;
  
  // Format as ZAR currency
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(zarValue);
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export function formatExpirationTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  const now = new Date();
  const expiration = new Date(date);
  const diffInMs = expiration.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInMs < 0) return "Expired";
  if (diffInHours < 24) return diffInHours === 0 ? "Expires soon" : `${diffInHours}h left`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} left`;
}

export function getCategoryGradient(categoryName: string): string {
  const gradients: Record<string, string> = {
    "Produce": "deal-gradient-produce",
    "Dairy": "deal-gradient-dairy", 
    "Meat": "deal-gradient-meat",
    "Bakery": "deal-gradient-bakery",
    "Frozen": "deal-gradient-frozen",
  };
  
  return gradients[categoryName] || "bg-gradient-to-br from-gray-400 to-gray-600";
}
