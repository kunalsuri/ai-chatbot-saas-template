/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { User, InsertUser, Quote, InsertQuote, Post, InsertPost, Template, InsertTemplate, Analytics, InsertAnalytics } from "@shared/schema";
import { ChatSession, UserWithPassword } from "@shared/types/api";
import { randomUUID } from "crypto";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config';
import { log } from './shared/utils/logger';
import { verifyPassword } from './features/auth/services/password';

const DATA_DIR = "./data";
const USERS_FILE = path.join(DATA_DIR, "users.json");
const QUOTES_FILE = path.join(DATA_DIR, "quotes.json");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");
const CHAT_HISTORY_FILE = path.join(DATA_DIR, "chat_history.json");

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  updateUserLastLogin(id: string): Promise<void>;

  // Quotes
  getQuote(id: string): Promise<Quote | undefined>;
  getQuotesByUser(userId: string): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;

  // Posts
  getPost(id: string): Promise<Post | undefined>;
  getPostsByUser(userId: string): Promise<Post[]>;
  getScheduledPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;

  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getPopularTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateUsage(id: string): Promise<void>;

  // Analytics
  getAnalyticsByPost(postId: string): Promise<Analytics[]>;
  getAnalyticsByUser(userId: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;

  // Chat
  getChatHistory(): Promise<ChatSession[]>;
  saveChatSession(session: ChatSession): Promise<void>;
  deleteChatSession(sessionId: string): Promise<void>;
}

export class FileStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private quotes: Map<string, Quote> = new Map();
  private posts: Map<string, Post> = new Map();
  private templates: Map<string, Template> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private chatHistory: ChatSession[] = [];

  constructor() {
    this.ensureDataDirectory();
    this.loadData();
  }

  private async ensureDataDirectory() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      log.error('Failed to create data directory', error, { directory: DATA_DIR });
    }
  }

  private async loadData() {
    try {
      await this.loadUsers();
      await this.loadQuotes();
      await this.loadPosts();
      await this.loadTemplates();
      await this.loadAnalytics();
      await this.loadChatHistory();
      await this.ensureDefaultData(); // Ensure default data exists
    } catch (error) {
      log.error('Failed to load application data', error);
    }
  }

  private async loadUsers() {
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      const users: User[] = JSON.parse(data);
      this.users = new Map(users.map(user => [user.id, user]));
    } catch {
      this.users = new Map();
    }
  }

  private async saveUsers() {
    const users = Array.from(this.users.values());
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  }

  private async loadChatHistory() {
    try {
      const data = await fs.readFile(CHAT_HISTORY_FILE, "utf-8");
      this.chatHistory = JSON.parse(data);
    } catch {
      this.chatHistory = [];
    }
  }

  private async saveChatHistory() {
    await fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(this.chatHistory, null, 2));
  }

  private async loadQuotes() {
    try {
      const data = await fs.readFile(QUOTES_FILE, "utf-8");
      const quotes: Quote[] = JSON.parse(data);
      this.quotes = new Map(quotes.map(quote => [quote.id, quote]));
    } catch {
      this.quotes = new Map();
    }
  }

  private async saveQuotes() {
    const quotes = Array.from(this.quotes.values());
    await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2));
  }

  private async loadPosts() {
    try {
      const data = await fs.readFile(POSTS_FILE, "utf-8");
      const posts: Post[] = JSON.parse(data);
      this.posts = new Map(posts.map(post => [post.id, post]));
    } catch {
      this.posts = new Map();
    }
  }

  private async savePosts() {
    const posts = Array.from(this.posts.values());
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
  }

  private async loadTemplates() {
    try {
      const data = await fs.readFile(TEMPLATES_FILE, "utf-8");
      const templates: Template[] = JSON.parse(data);
      this.templates = new Map(templates.map(template => [template.id, template]));
    } catch {
      this.templates = new Map();
      await this.seedTemplates();
    }
  }

  private async saveTemplates() {
    const templates = Array.from(this.templates.values());
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
  }

  private async loadAnalytics() {
    try {
      const data = await fs.readFile(ANALYTICS_FILE, "utf-8");
      const analytics: Analytics[] = JSON.parse(data);
      this.analytics = new Map(analytics.map(analytic => [analytic.id, analytic]));
    } catch {
      this.analytics = new Map();
    }
  }

  private async saveAnalytics() {
    const analytics = Array.from(this.analytics.values());
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  }

  private async seedTemplates() {
    const defaultTemplates = [
      {
        name: "Minimal Quote",
        description: "Clean typography with simple background",
        backgroundColor: "#f8fafc",
        textColor: "#1e293b",
        fontFamily: "Inter",
        fontSize: 24,
        isPublic: true,
        usageCount: 47,
      },
      {
        name: "Gradient Style",
        description: "Modern gradient backgrounds",
        backgroundColor: "#8b5cf6",
        textColor: "#ffffff",
        fontFamily: "Inter",
        fontSize: 28,
        isPublic: true,
        usageCount: 32,
      },
      {
        name: "Bold Typography",
        description: "Strong visual impact with bold fonts",
        backgroundColor: "#1e293b",
        textColor: "#f59e0b",
        fontFamily: "Inter",
        fontSize: 32,
        isPublic: true,
        usageCount: 28,
      },
      {
        name: "Nature Theme",
        description: "Organic elements and earth tones",
        backgroundColor: "#059669",
        textColor: "#ffffff",
        fontFamily: "Inter",
        fontSize: 24,
        isPublic: true,
        usageCount: 23,
      },
    ];

    for (const template of defaultTemplates) {
      const id = randomUUID();
      const newTemplate: Template = {
        id,
        ...template,
        thumbnail: null,
        createdAt: new Date(),
      };
      this.templates.set(id, newTemplate);
    }
    await this.saveTemplates();
  }

  // Ensure default data like admin user exists
  private async ensureDefaultData() {
    // Create default admin user if no users exist
    if (this.users.size === 0) {
      const defaultUser: User = {
        id: "admin-001",
        username: config.admin.defaultUsername || "admin",
        email: config.admin.defaultEmail || "admin@marketmagic.com",
        password: config.admin.defaultPassword || "admin123", // In production, this should be hashed
        plan: "premium",
        createdAt: new Date("2024-08-24T00:00:00.000Z"),
      };
      this.users.set(defaultUser.id, defaultUser);
      await this.saveUsers();
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      plan: "free",
      createdAt: new Date(),
    };

    // Save to both memory and file
    this.users.set(id, user);

    // Update the users file with password
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      const usersWithPasswords: UserWithPassword[] = JSON.parse(data);
      usersWithPasswords.push({
        ...user,
        password: (insertUser as InsertUser & { password: string }).password,
        lastLogin: null
      });
      await fs.writeFile(USERS_FILE, JSON.stringify(usersWithPasswords, null, 2));
    } catch {
      // If file doesn't exist, create it
      const usersWithPasswords: UserWithPassword[] = [{
        ...user,
        password: (insertUser as InsertUser & { password: string }).password,
        lastLogin: null
      }];
      await fs.writeFile(USERS_FILE, JSON.stringify(usersWithPasswords, null, 2));
    }

    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    // Load users from file to get access to password field
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      const usersWithPasswords: Array<User & { password: string }> = JSON.parse(data);
      const userWithPassword = usersWithPasswords.find(u => u.username === username);

      if (!userWithPassword) return undefined;

      // Verify password using bcrypt
      const isValidPassword = await verifyPassword(password, userWithPassword.password);
      if (!isValidPassword) return undefined;

      // Return user without password
      const { password: _, ...user } = userWithPassword;
      return user as User;
    } catch {
      return undefined;
    }
  }

  async updateUserLastLogin(id: string): Promise<void> {
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      const usersWithPasswords: UserWithPassword[] = JSON.parse(data);
      const userIndex = usersWithPasswords.findIndex(u => u.id === id);

      if (userIndex !== -1) {
        usersWithPasswords[userIndex].lastLogin = new Date().toISOString();
        await fs.writeFile(USERS_FILE, JSON.stringify(usersWithPasswords, null, 2));
      }
    } catch (error) {
      log.error('Failed to update user last login', error, { userId: id });
    }
  }

  // Quote methods
  async getQuote(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async getQuotesByUser(userId: string): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(quote => quote.userId === userId);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = {
      ...insertQuote,
      id,
      author: insertQuote.author || null,
      category: insertQuote.category || null,
      createdAt: new Date(),
    };
    this.quotes.set(id, quote);
    await this.saveQuotes();
    return quote;
  }

  // Post methods
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getScheduledPosts(): Promise<Post[]> {
    const now = new Date();
    return Array.from(this.posts.values())
      .filter(post => post.status === "scheduled" && post.scheduledFor && new Date(post.scheduledFor) <= now);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      status: insertPost.status || "draft",
      platform: insertPost.platform || "instagram",
      metadata: insertPost.metadata || null,
      imageUrl: insertPost.imageUrl || null,
      backgroundColor: insertPost.backgroundColor || null,
      textColor: insertPost.textColor || null,
      fontFamily: insertPost.fontFamily || null,
      fontSize: insertPost.fontSize || null,
      scheduledFor: insertPost.scheduledFor || null,
      publishedAt: insertPost.publishedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    await this.savePosts();
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;

    const updatedPost: Post = {
      ...post,
      ...updates,
      updatedAt: new Date(),
    };
    this.posts.set(id, updatedPost);
    await this.savePosts();
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    const deleted = this.posts.delete(id);
    if (deleted) {
      await this.savePosts();
    }
    return deleted;
  }

  // Template methods
  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.isPublic);
  }

  async getPopularTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(template => template.isPublic)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 8);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = {
      ...insertTemplate,
      id,
      description: insertTemplate.description || null,
      thumbnail: insertTemplate.thumbnail || null,
      backgroundColor: insertTemplate.backgroundColor || null,
      textColor: insertTemplate.textColor || null,
      fontFamily: insertTemplate.fontFamily || null,
      fontSize: insertTemplate.fontSize || null,
      isPublic: insertTemplate.isPublic || true,
      usageCount: 0,
      createdAt: new Date(),
    };
    this.templates.set(id, template);
    await this.saveTemplates();
    return template;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      this.templates.set(id, template);
      await this.saveTemplates();
    }
  }

  // Analytics methods
  async getAnalyticsByPost(postId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytic => analytic.postId === postId);
  }

  async getAnalyticsByUser(userId: string): Promise<Analytics[]> {
    const userPosts = Array.from(this.posts.values()).filter(post => post.userId === userId);
    const postIds = userPosts.map(post => post.id);
    return Array.from(this.analytics.values()).filter(analytic => postIds.includes(analytic.postId));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      likes: insertAnalytics.likes || 0,
      shares: insertAnalytics.shares || 0,
      comments: insertAnalytics.comments || 0,
      views: insertAnalytics.views || 0,
      engagementRate: insertAnalytics.engagementRate || 0,
      recordedAt: new Date(),
    };
    this.analytics.set(id, analytics);
    await this.saveAnalytics();
    return analytics;
  }

  // Chat methods
  async getChatHistory(): Promise<ChatSession[]> {
    return this.chatHistory;
  }

  async saveChatSession(session: ChatSession): Promise<void> {
    const existingIndex = this.chatHistory.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      this.chatHistory[existingIndex] = session;
    } else {
      this.chatHistory.push(session);
    }
    await this.saveChatHistory();
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    this.chatHistory = this.chatHistory.filter(session => session.id !== sessionId);
    await this.saveChatHistory();
  }
}

export const storage = new FileStorage();