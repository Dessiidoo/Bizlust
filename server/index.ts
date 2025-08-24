import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { log } from "./vite";

const app = express();
const PORT = 5000;

app.use(express.json());

async function startServer() {
  try {
    const server = await registerRoutes(app);
    await setupVite(app, server);
    
    server.listen(PORT, "0.0.0.0", () => {
      log(`serving on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
