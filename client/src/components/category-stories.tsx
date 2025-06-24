import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { getCategoryGradient } from "@/lib/utils";

export default function CategoryStories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-2"></div>
                <div className="w-12 h-3 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <div key={category.id} className="flex-shrink-0 text-center">
              <div className={`w-16 h-16 rounded-full ${getCategoryGradient(category.name)} p-0.5 mb-2`}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <img
                    src={category.imageUrl || ""}
                    alt={category.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
