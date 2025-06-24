import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDealSchema, 
  insertLikeSchema, 
  insertShoppingListSchema, 
  insertShoppingListItemSchema,
  insertSharedListSchema,
  insertFollowerSchema,
  insertCommentSchema,
  insertChatMessageSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all stores
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all deals
  app.get("/api/deals", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const deals = await storage.getDeals();
      
      // Add isLiked status for each deal
      const dealsWithLikeStatus = await Promise.all(
        deals.map(async (deal) => {
          const like = await storage.getLike(deal.id, userId);
          return {
            ...deal,
            isLiked: !!like,
          };
        })
      );
      
      res.json(dealsWithLikeStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  // Create a new deal
  app.post("/api/deals", async (req, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create deal" });
      }
    }
  });

  // Toggle like on a deal
  app.post("/api/deals/:id/like", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      const userId = req.body.userId || "anonymous";

      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      // Check if deal exists
      const deal = await storage.getDeal(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      // Check if already liked
      const existingLike = await storage.getLike(dealId, userId);
      
      if (existingLike) {
        // Unlike
        await storage.deleteLike(dealId, userId);
        const updatedLikes = await storage.getDealLikes(dealId);
        res.json({ liked: false, likes: updatedLikes });
      } else {
        // Like
        await storage.createLike({ dealId, userId });
        const updatedLikes = await storage.getDealLikes(dealId);
        res.json({ liked: true, likes: updatedLikes });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Image upload endpoint (for demo, we'll just return a placeholder URL)
  app.post("/api/upload", async (req, res) => {
    try {
      // In a real app, you would handle file upload here
      // For now, return a placeholder image URL
      const imageUrl = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Shopping Lists Routes
  app.get("/api/shopping-lists", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const lists = await storage.getShoppingLists(userId);
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping lists" });
    }
  });

  app.post("/api/shopping-lists", async (req, res) => {
    try {
      const validatedData = insertShoppingListSchema.parse(req.body);
      const list = await storage.createShoppingList(validatedData);
      res.status(201).json(list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid list data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create shopping list" });
      }
    }
  });

  app.get("/api/shopping-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }
      
      const list = await storage.getShoppingList(id);
      if (!list) {
        return res.status(404).json({ message: "Shopping list not found" });
      }
      
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping list" });
    }
  });

  // Shopping List Items Routes
  app.post("/api/shopping-lists/:id/items", async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const validatedData = insertShoppingListItemSchema.parse({
        ...req.body,
        listId,
      });
      
      const item = await storage.createShoppingListItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add item to list" });
      }
    }
  });

  app.patch("/api/shopping-list-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const updatedItem = await storage.updateShoppingListItem(id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/shopping-list-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const deleted = await storage.deleteShoppingListItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Share Shopping List
  app.post("/api/shopping-lists/:id/share", async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "Invalid list ID" });
      }

      const { sharedWithUserId, canEdit } = req.body;
      const sharedList = await storage.shareShoppingList(listId, sharedWithUserId, Boolean(canEdit));
      res.status(201).json(sharedList);
    } catch (error) {
      res.status(500).json({ message: "Failed to share list" });
    }
  });

  // Barcode scanning endpoint (mock for demo)
  app.post("/api/scan-barcode", async (req, res) => {
    try {
      // Mock barcode scanning results
      const mockProducts = [
        { barcode: "123456789", name: "Organic Bananas", price: "$2.99", category: "Produce" },
        { barcode: "987654321", name: "Whole Milk", price: "$3.49", category: "Dairy" },
        { barcode: "456789123", name: "Whole Wheat Bread", price: "$2.29", category: "Bakery" },
        { barcode: "321654987", name: "Ground Beef", price: "$5.99", category: "Meat" },
        { barcode: "654321098", name: "Frozen Pizza", price: "$4.49", category: "Frozen" },
      ];
      
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      res.json(randomProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to scan barcode" });
    }
  });

  // Followers Routes
  app.get("/api/followers", async (req, res) => {
    try {
      const userId = req.query.userId as string || "anonymous";
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.post("/api/follow", async (req, res) => {
    try {
      const { followerId, followingId } = req.body;
      const follow = await storage.followUser(followerId, followingId);
      res.status(201).json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/follow", async (req, res) => {
    try {
      const { followerId, followingId } = req.body;
      const success = await storage.unfollowUser(followerId, followingId);
      if (success) {
        res.json({ message: "Unfollowed successfully" });
      } else {
        res.status(404).json({ message: "Follow relationship not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Comments Routes
  app.get("/api/deals/:id/comments", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const comments = await storage.getComments(dealId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/deals/:id/comments", async (req, res) => {
    try {
      const dealId = parseInt(req.params.id);
      if (isNaN(dealId)) {
        return res.status(400).json({ message: "Invalid deal ID" });
      }

      const validatedData = insertCommentSchema.parse({
        ...req.body,
        dealId,
      });

      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  // Chat Messages Routes
  app.get("/api/chat-messages", async (req, res) => {
    try {
      const { user1, user2 } = req.query;
      if (!user1 || !user2) {
        return res.status(400).json({ message: "Both user1 and user2 are required" });
      }

      const messages = await storage.getChatMessages(user1 as string, user2 as string);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat-messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
