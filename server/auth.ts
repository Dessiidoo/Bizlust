import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// User registration
export async function registerUser(email: string, password: string, firstName?: string, lastName?: string) {
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await storage.createUser({
    id: nanoid(),
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  return user;
}

// User login
export async function loginUser(email: string, password: string) {
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return user;
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach user to request
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  next();
};

// Setup authentication routes
export function setupAuth(app: Express) {
  app.use(getSession());

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await registerUser(email, password, firstName, lastName);
      
      // Create session
      (req as any).session.userId = user.id;
      
      res.json({ message: "Registration successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await loginUser(email, password);
      
      // Create session
      (req as any).session.userId = user.id;
      
      res.json({ message: "Login successful", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user route
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, companyName: user.companyName, industry: user.industry, companySize: user.companySize, subscriptionTier: user.subscriptionTier });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}