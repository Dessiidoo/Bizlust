import express from "express";
import session from "express-session";
import { exec } from "child_process";
import { promisify } from "util";
import cookieParser from 'cookie-parser';
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

const execAsync = promisify(exec);

const app = express();
app.use(cookieParser());

// Parse JSON bodies (must come before routes that need body parsing)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ADMIN_KEY = process.env.ADMIN_KEY;

function requireAdmin(req: any, res: any, next: any) {
  if (!ADMIN_KEY) return res.status(500).send('Missing ADMIN_KEY');
  if (req.cookies?.admin === ADMIN_KEY) return next();
  return res.status(401).send('Unauthorized');
}

app.get('/admin/login', (_req, res) => {
  const hasAdminKey = !!ADMIN_KEY;
  const keyLength = ADMIN_KEY ? ADMIN_KEY.length : 0;
  res.send(`
    <form method="POST" action="/admin/login" style="max-width:420px;margin:40px auto;font-family:system-ui">
      <h3>LeadPro Admin</h3>
      <input name="key" type="password" placeholder="Admin Key" style="width:100%;padding:10px" />
      <button style="margin-top:10px;padding:10px 14px">Login</button>
      <p style="font-size:12px;color:#666;margin-top:20px">
        Debug: Key configured: ${hasAdminKey}, Length: ${keyLength}
      </p>
    </form>
  `);
});

app.post('/admin/login', (req, res) => {
  console.log('Admin login attempt:');
  console.log('- Received key:', req.body?.key);
  console.log('- Expected key:', ADMIN_KEY);
  console.log('- Keys match:', req.body?.key === ADMIN_KEY);
  
  if (req.body?.key === ADMIN_KEY) {
    res.cookie('admin', ADMIN_KEY || '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7*24*60*60*1000
    });
    return res.redirect('/admin');
  }
  return res.status(401).send('Invalid key');
});

app.get('/admin', requireAdmin, (_req, res) => {
  res.send(`<h2>LeadPro Admin</h2><p>You're in. Build your controls here.</p>`);
});
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