import express from "express";
import session from "express-session";
import { exec } from "child_process";
import { promisify } from "util";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

const execAsync = promisify(exec);

const app = express();
const PORT = parseInt(process.env.PORT ?? "5000");

// Configure session middleware  
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    // Setup database schema first
    await setupDatabase();
    
    // Register API routes and get HTTP server
    const httpServer = await registerRoutes(app);
    
    // Set up Vite development server or serve static files in production
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, httpServer);
      log("Development server with Vite hot reload ready");
    } else {
      // Import serveStatic for production
      const { serveStatic } = await import("./vite");
      serveStatic(app);
      log("Production server serving static files ready");
    }

    // Start the server
    httpServer.listen(PORT, "0.0.0.0", () => {
      log(`🚀 Server running on port ${PORT}`);
      log(`🌐 Access your app at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function setupDatabase() {
  // Skip database setup in production - should be handled during build/deployment
  if (process.env.NODE_ENV === "production") {
    log("Skipping database setup in production");
    return;
  }
  
  try {
    log("Setting up database schema...");
    await execAsync("npx drizzle-kit push --force");
    log("✅ Database schema setup complete");
  } catch (error) {
    log("⚠️ Database setup failed, but continuing (may be normal for first run)");
    console.error("Database setup error:", error);
  }
}

startServer();