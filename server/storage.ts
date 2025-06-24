import {
  stores,
  categories,
  deals,
  likes,
  users,
  shoppingLists,
  shoppingListItems,
  sharedLists,
  followers,
  comments,
  chatMessages,
  type Store,
  type Category,
  type Deal,
  type Like,
  type User,
  type ShoppingList,
  type ShoppingListItem,
  type SharedList,
  type Follower,
  type Comment,
  type ChatMessage,
  type InsertStore,
  type InsertCategory,
  type InsertDeal,
  type InsertLike,
  type InsertUser,
  type InsertShoppingList,
  type InsertShoppingListItem,
  type InsertSharedList,
  type InsertFollower,
  type InsertComment,
  type InsertChatMessage,
  type DealWithStore,
  type ShoppingListWithItems,
  type CommentWithUser,
  type UserProfile,
} from "@shared/schema";

export interface IStorage {
  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Deals
  getDeals(): Promise<DealWithStore[]>;
  getDeal(id: number): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDealLikes(id: number, likes: number): Promise<Deal | undefined>;

  // Likes
  getLike(dealId: number, userId: string): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(dealId: number, userId: string): Promise<boolean>;
  getDealLikes(dealId: number): Promise<number>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Shopping Lists
  getShoppingLists(userId: string): Promise<ShoppingListWithItems[]>;
  getShoppingList(id: number): Promise<ShoppingListWithItems | undefined>;
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  updateShoppingList(id: number, updates: Partial<ShoppingList>): Promise<ShoppingList | undefined>;
  deleteShoppingList(id: number): Promise<boolean>;

  // Shopping List Items
  getShoppingListItems(listId: number): Promise<ShoppingListItem[]>;
  createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem>;
  updateShoppingListItem(id: number, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem | undefined>;
  deleteShoppingListItem(id: number): Promise<boolean>;

  // Shared Lists
  shareShoppingList(listId: number, sharedWith: string, canEdit: boolean): Promise<SharedList>;
  getSharedLists(userId: string): Promise<ShoppingListWithItems[]>;

  // Followers
  followUser(followerId: string, followingId: string): Promise<Follower>;
  unfollowUser(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<UserProfile[]>;
  getFollowing(userId: string): Promise<UserProfile[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // Comments
  getComments(dealId: number): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;

  // Chat Messages
  getChatMessages(userId1: string, userId2: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessageAsRead(messageId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private stores: Map<number, Store> = new Map();
  private categories: Map<number, Category> = new Map();
  private deals: Map<number, Deal> = new Map();
  private likes: Map<string, Like> = new Map(); // key: `${dealId}-${userId}`
  private users: Map<number, User> = new Map();
  private usersByUsername: Map<string, User> = new Map(); // username -> user lookup
  private shoppingLists: Map<number, ShoppingList> = new Map();
  private shoppingListItems: Map<number, ShoppingListItem> = new Map();
  private sharedLists: Map<number, SharedList> = new Map();
  private followers: Map<string, Follower> = new Map(); // key: `${followerId}-${followingId}`
  private comments: Map<number, Comment> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private currentStoreId = 1;
  private currentCategoryId = 1;
  private currentDealId = 1;
  private currentLikeId = 1;
  private currentUserId = 1;
  private currentShoppingListId = 1;
  private currentShoppingListItemId = 1;
  private currentSharedListId = 1;
  private currentFollowerId = 1;
  private currentCommentId = 1;
  private currentChatMessageId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed stores
    const sampleStores: InsertStore[] = [
      {
        name: "Whole Foods Market",
        location: "Downtown",
        address: "123 Main St, Downtown",
        latitude: "40.7128",
        longitude: "-74.0060",
        logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      },
      {
        name: "Target",
        location: "Midtown",
        address: "456 Commerce Ave, Midtown",
        latitude: "40.7589",
        longitude: "-73.9851",
        logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      },
      {
        name: "Kroger",
        location: "Westside",
        address: "789 West Blvd, Westside",
        latitude: "40.7505",
        longitude: "-74.0087",
        logoUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      },
      {
        name: "Costco Wholesale",
        location: "Northside",
        address: "321 Industrial Dr, Northside",
        latitude: "40.7831",
        longitude: "-73.9712",
        logoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      },
      {
        name: "Safeway",
        location: "Downtown",
        address: "654 Center St, Downtown",
        latitude: "40.7174",
        longitude: "-74.0113",
        logoUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      },
      {
        name: "Trader Joe's",
        location: "Eastside",
        address: "987 Park Ave, Eastside",
        latitude: "40.7614",
        longitude: "-73.9776",
        logoUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40",
      },
    ];

    sampleStores.forEach(store => this.createStore(store));

    // Seed categories
    const sampleCategories: InsertCategory[] = [
      {
        name: "Produce",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
        color: "from-green-400 to-emerald-500",
      },
      {
        name: "Dairy",
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
        color: "from-blue-400 to-blue-600",
      },
      {
        name: "Meat",
        imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
        color: "from-red-400 to-red-600",
      },
      {
        name: "Bakery",
        imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
        color: "from-yellow-400 to-orange-500",
      },
      {
        name: "Frozen",
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
        color: "from-cyan-400 to-blue-500",
      },
    ];

    sampleCategories.forEach(category => this.createCategory(category));

    // Seed sample deals with user assignments
    const sampleDeals: (InsertDeal & { userId: string })[] = [
      {
        storeId: 1, // Whole Foods
        categoryId: 1, // Produce
        title: "Fresh Organic Vegetables",
        description: "🥕 Fresh organic vegetables 50% off! Perfect for your healthy meal prep. Grab them before they're gone! #OrganicDeals #FreshProduce",
        originalPrice: "$4.99",
        salePrice: "$2.49",
        discountPercent: 50,
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        userId: "user123",
      },
      {
        storeId: 2, // Target
        categoryId: 2, // Dairy
        title: "Dairy Products Special",
        description: "🥛 Dairy deals! Buy 2 get 1 FREE on all milk, cheese, and yogurt. Stock up for the week! Perfect for families. #DairyDeals #FamilySavings",
        originalPrice: "$12.97",
        salePrice: "$8.98",
        discountPercent: 33,
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        userId: "sarah_deals",
      },
      {
        storeId: 3, // Kroger
        categoryId: 3, // Meat
        title: "Premium Steaks Weekend Sale",
        description: "🥩 Premium steaks 30% off this weekend! Perfect for your BBQ plans. Quality cuts at unbeatable prices! #MeatDeals #WeekendBBQ #PremiumCuts",
        originalPrice: "$24.99",
        salePrice: "$17.49",
        discountPercent: 30,
        imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        userId: "mike_saves",
      },
    ];

    sampleDeals.forEach(deal => this.createDeal(deal as InsertDeal));

    // Seed sample users
    const sampleUsers = [
      { username: "user123", displayName: "John Doe", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", bio: "Love finding great deals!" },
      { username: "sarah_deals", displayName: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face", bio: "Grocery shopping expert" },
      { username: "mike_saves", displayName: "Mike Wilson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", bio: "Deals hunter 🛒" },
      { username: "lisa_shops", displayName: "Lisa Chen", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", bio: "Smart shopper mom" },
    ];

    sampleUsers.forEach((userData, index) => {
      const user: User = {
        ...userData,
        id: this.currentUserId++,
        password: "demo123", // Demo password
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
      this.usersByUsername.set(user.username, user);
    });

    // Seed some follow relationships
    this.followUser("user123", "sarah_deals");
    this.followUser("user123", "mike_saves");
    this.followUser("sarah_deals", "user123");
    this.followUser("lisa_shops", "user123");

    // Seed some comments
    this.createComment({ dealId: 1, userId: "sarah_deals", content: "Great deal! I got these yesterday 🥕" });
    this.createComment({ dealId: 1, userId: "mike_saves", content: "Thanks for sharing! Heading there now" });
    this.createComment({ dealId: 2, userId: "lisa_shops", content: "Perfect timing, we're out of milk!" });
  }

  // Store methods
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const store: Store = {
      ...insertStore,
      id: this.currentStoreId++,
      address: insertStore.address || null,
      latitude: insertStore.latitude || null,
      longitude: insertStore.longitude || null,
      logoUrl: insertStore.logoUrl || null,
    };
    this.stores.set(store.id, store);
    return store;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      ...insertCategory,
      id: this.currentCategoryId++,
      imageUrl: insertCategory.imageUrl || null,
      color: insertCategory.color || null,
    };
    this.categories.set(category.id, category);
    return category;
  }

  // Deal methods
  async getDeals(): Promise<DealWithStore[]> {
    const dealsArray = Array.from(this.deals.values());
    const dealsWithStore: DealWithStore[] = [];

    for (const deal of dealsArray) {
      const store = await this.getStore(deal.storeId);
      const category = await this.getCategory(deal.categoryId);
      const user = await this.getUserByUsername(deal.userId || "user123"); // Fallback for existing deals
      if (store && category && user) {
        dealsWithStore.push({
          ...deal,
          store,
          category,
          user,
        });
      }
    }

    return dealsWithStore.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime; // Most recent first
    });
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const deal: Deal = {
      ...insertDeal,
      id: this.currentDealId++,
      createdAt: new Date(),
      likes: 0,
      originalPrice: insertDeal.originalPrice || null,
      salePrice: insertDeal.salePrice || null,
      discountPercent: insertDeal.discountPercent || null,
      expiresAt: insertDeal.expiresAt || null,
    };
    this.deals.set(deal.id, deal);
    return deal;
  }

  async updateDealLikes(id: number, likes: number): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (deal) {
      const updatedDeal = { ...deal, likes };
      this.deals.set(id, updatedDeal);
      return updatedDeal;
    }
    return undefined;
  }

  // Like methods
  async getLike(dealId: number, userId: string): Promise<Like | undefined> {
    return this.likes.get(`${dealId}-${userId}`);
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const like: Like = {
      ...insertLike,
      id: this.currentLikeId++,
    };
    this.likes.set(`${like.dealId}-${like.userId}`, like);
    
    // Update deal likes count
    const currentLikes = await this.getDealLikes(insertLike.dealId);
    await this.updateDealLikes(insertLike.dealId, currentLikes + 1);
    
    return like;
  }

  async deleteLike(dealId: number, userId: string): Promise<boolean> {
    const deleted = this.likes.delete(`${dealId}-${userId}`);
    
    if (deleted) {
      // Update deal likes count
      const currentLikes = await this.getDealLikes(dealId);
      await this.updateDealLikes(dealId, Math.max(0, currentLikes - 1));
    }
    
    return deleted;
  }

  async getDealLikes(dealId: number): Promise<number> {
    return Array.from(this.likes.values()).filter(like => like.dealId === dealId).length;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      displayName: insertUser.displayName || null,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }

  // Shopping Lists methods
  async getShoppingLists(userId: string): Promise<ShoppingListWithItems[]> {
    const userLists = Array.from(this.shoppingLists.values()).filter(list => list.userId === userId);
    const listsWithItems: ShoppingListWithItems[] = [];

    for (const list of userLists) {
      const items = await this.getShoppingListItems(list.id);
      listsWithItems.push({
        ...list,
        items,
        itemCount: items.length,
      });
    }

    return listsWithItems.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  async getShoppingList(id: number): Promise<ShoppingListWithItems | undefined> {
    const list = this.shoppingLists.get(id);
    if (!list) return undefined;

    const items = await this.getShoppingListItems(id);
    return {
      ...list,
      items,
      itemCount: items.length,
    };
  }

  async createShoppingList(insertList: InsertShoppingList): Promise<ShoppingList> {
    const list: ShoppingList = {
      ...insertList,
      id: this.currentShoppingListId++,
      createdAt: new Date(),
      isShared: insertList.isShared || false,
    };
    this.shoppingLists.set(list.id, list);
    return list;
  }

  async updateShoppingList(id: number, updates: Partial<ShoppingList>): Promise<ShoppingList | undefined> {
    const list = this.shoppingLists.get(id);
    if (!list) return undefined;

    const updatedList = { ...list, ...updates };
    this.shoppingLists.set(id, updatedList);
    return updatedList;
  }

  async deleteShoppingList(id: number): Promise<boolean> {
    // Delete all items in the list first
    const items = await this.getShoppingListItems(id);
    for (const item of items) {
      this.shoppingListItems.delete(item.id);
    }
    
    // Delete shared references
    Array.from(this.sharedLists.values())
      .filter(shared => shared.listId === id)
      .forEach(shared => this.sharedLists.delete(shared.id));
    
    return this.shoppingLists.delete(id);
  }

  // Shopping List Items methods
  async getShoppingListItems(listId: number): Promise<ShoppingListItem[]> {
    return Array.from(this.shoppingListItems.values())
      .filter(item => item.listId === listId)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
  }

  async createShoppingListItem(insertItem: InsertShoppingListItem): Promise<ShoppingListItem> {
    const item: ShoppingListItem = {
      ...insertItem,
      id: this.currentShoppingListItemId++,
      createdAt: new Date(),
      quantity: insertItem.quantity || 1,
      price: insertItem.price || null,
      category: insertItem.category || null,
      isCompleted: insertItem.isCompleted || false,
      barcode: insertItem.barcode || null,
    };
    this.shoppingListItems.set(item.id, item);
    return item;
  }

  async updateShoppingListItem(id: number, updates: Partial<ShoppingListItem>): Promise<ShoppingListItem | undefined> {
    const item = this.shoppingListItems.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates };
    this.shoppingListItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteShoppingListItem(id: number): Promise<boolean> {
    return this.shoppingListItems.delete(id);
  }

  // Shared Lists methods
  async shareShoppingList(listId: number, sharedWithUserId: string, canEdit: boolean): Promise<SharedList> {
    const sharedList: SharedList = {
      id: this.currentSharedListId++,
      listId,
      sharedWithUserId,
      canEdit,
      createdAt: new Date(),
    };
    this.sharedLists.set(sharedList.id, sharedList);
    return sharedList;
  }

  async getSharedLists(userId: string): Promise<ShoppingListWithItems[]> {
    const sharedWithUser = Array.from(this.sharedLists.values())
      .filter(shared => shared.sharedWithUserId === userId);
    
    const sharedLists: ShoppingListWithItems[] = [];
    
    for (const shared of sharedWithUser) {
      const list = await this.getShoppingList(shared.listId);
      if (list) {
        sharedLists.push(list);
      }
    }
    
    return sharedLists;
  }

  // Followers methods
  async followUser(followerId: string, followingId: string): Promise<Follower> {
    const follower: Follower = {
      id: this.currentFollowerId++,
      followerId,
      followingId,
      createdAt: new Date(),
    };
    this.followers.set(`${followerId}-${followingId}`, follower);
    return follower;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    return this.followers.delete(`${followerId}-${followingId}`);
  }

  async getFollowers(userId: string): Promise<UserProfile[]> {
    const userFollowers = Array.from(this.followers.values())
      .filter(follow => follow.followingId === userId);
    
    const profiles: UserProfile[] = [];
    for (const follow of userFollowers) {
      const user = await this.getUserByUsername(follow.followerId);
      if (user) {
        const followersCount = await this.getFollowersCount(user.username);
        const followingCount = await this.getFollowingCount(user.username);
        profiles.push({
          ...user,
          followersCount,
          followingCount,
        });
      }
    }
    return profiles;
  }

  async getFollowing(userId: string): Promise<UserProfile[]> {
    const userFollowing = Array.from(this.followers.values())
      .filter(follow => follow.followerId === userId);
    
    const profiles: UserProfile[] = [];
    for (const follow of userFollowing) {
      const user = await this.getUserByUsername(follow.followingId);
      if (user) {
        const followersCount = await this.getFollowersCount(user.username);
        const followingCount = await this.getFollowingCount(user.username);
        profiles.push({
          ...user,
          followersCount,
          followingCount,
        });
      }
    }
    return profiles;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.followers.has(`${followerId}-${followingId}`);
  }

  private async getFollowersCount(userId: string): Promise<number> {
    return Array.from(this.followers.values()).filter(f => f.followingId === userId).length;
  }

  private async getFollowingCount(userId: string): Promise<number> {
    return Array.from(this.followers.values()).filter(f => f.followerId === userId).length;
  }

  // Comments methods
  async getComments(dealId: number): Promise<CommentWithUser[]> {
    const dealComments = Array.from(this.comments.values())
      .filter(comment => comment.dealId === dealId)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime; // Oldest first
      });

    const commentsWithUsers: CommentWithUser[] = [];
    for (const comment of dealComments) {
      const user = await this.getUserByUsername(comment.userId);
      if (user) {
        commentsWithUsers.push({
          ...comment,
          user,
        });
      }
    }
    return commentsWithUsers;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comment: Comment = {
      ...insertComment,
      id: this.currentCommentId++,
      createdAt: new Date(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Chat Messages methods
  async getChatMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => 
        (message.fromUserId === userId1 && message.toUserId === userId2) ||
        (message.fromUserId === userId2 && message.toUserId === userId1)
      )
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime; // Oldest first
      });
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...insertMessage,
      id: this.currentChatMessageId++,
      createdAt: new Date(),
      readAt: null,
      dealId: insertMessage.dealId || null,
    };
    this.chatMessages.set(message.id, message);
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<boolean> {
    const message = this.chatMessages.get(messageId);
    if (message) {
      const updatedMessage = { ...message, readAt: new Date() };
      this.chatMessages.set(messageId, updatedMessage);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
