import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Function to get session middleware
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "project-gallery-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Simplified auth setup - using a temp demo approach
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Demo login endpoint - in production this would use proper OAuth
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      // Look up user or create new one
      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        // Create a demo user
        user = await storage.upsertUser({
          id: `demo-${Date.now()}`,
          username,
          email: `${username}@example.com`,
          firstName: username,
          lastName: "User",
          profileImageUrl: null,
        });
      }
      
      // Set user in session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      };
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Logout endpoint
  app.get("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      res.redirect("/");
    });
  });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  return next();
};