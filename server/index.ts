import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

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
    // Register API routes and get HTTP server
    const httpServer = await registerRoutes(app);
    
    // Set up Vite development server
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, httpServer);
      log("Development server with Vite hot reload ready");
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

startServer();