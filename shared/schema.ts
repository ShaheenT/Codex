import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  logoUrl: text("logo_url"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  color: text("color"),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Who shared this deal
  storeId: integer("store_id").notNull(),
  categoryId: integer("category_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  originalPrice: text("original_price"),
  salePrice: text("sale_price"),
  discountPercent: integer("discount_percent"),
  imageUrl: text("image_url").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  likes: integer("likes").default(0),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  userId: text("user_id").notNull(), // Simple user identifier for demo
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: text("follower_id").notNull(),
  followingId: text("following_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  content: text("content").notNull(),
  dealId: integer("deal_id"), // Optional: reference to deal being discussed
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  name: text("name").notNull(),
  quantity: integer("quantity").default(1),
  price: text("price"),
  category: text("category"),
  isCompleted: boolean("is_completed").default(false),
  barcode: text("barcode"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sharedLists = pgTable("shared_lists", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").notNull(),
  sharedWithUserId: text("shared_with_user_id").notNull(),
  canEdit: boolean("can_edit").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, likes: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({ id: true, createdAt: true });
export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems).omit({ id: true, createdAt: true });
export const insertSharedListSchema = createInsertSchema(sharedLists).omit({ id: true, createdAt: true });
export const insertFollowerSchema = createInsertSchema(followers).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true, readAt: true });

export type Store = typeof stores.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type User = typeof users.$inferSelect;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type SharedList = typeof sharedLists.$inferSelect;
export type Follower = typeof followers.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;
export type InsertSharedList = z.infer<typeof insertSharedListSchema>;
export type InsertFollower = z.infer<typeof insertFollowerSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type DealWithStore = Deal & {
  store: Store;
  category: Category;
  user: User;
  isLiked?: boolean;
};

export type ShoppingListWithItems = ShoppingList & {
  items: ShoppingListItem[];
  itemCount: number;
};

export type CommentWithUser = Comment & {
  user: User;
};

export type UserProfile = User & {
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
};
