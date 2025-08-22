import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../shared/schema";

// Initialize database connection
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || "";
};

// Create database instance
const createDatabase = () => {
  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    console.warn("No DATABASE_URL found, using in-memory storage");
    return null;
  }
  
  try {
    return drizzle(databaseUrl, { schema });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return null;
  }
};

// In-memory storage fallback
class MemStorage {
  private data: Map<string, any> = new Map();
  
  async get(key: string): Promise<any> {
    return this.data.get(key);
  }
  
  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }
  
  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }
  
  async has(key: string): Promise<boolean> {
    return this.data.has(key);
  }
  
  async clear(): Promise<void> {
    this.data.clear();
  }
}

// Export storage interface
export const db = createDatabase();
export const storage = new MemStorage();