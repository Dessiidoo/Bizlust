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
    
    // Setup admin routes AFTER main routes
    setupAdminRoutes(app);
    
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

// Admin route setup function
function setupAdminRoutes(app: any) {
  const ADMIN_KEY = process.env.ADMIN_KEY;

  function requireAdmin(req: any, res: any, next: any) {
    if (!ADMIN_KEY) return res.status(500).send('Missing ADMIN_KEY');
    if (req.cookies?.admin === ADMIN_KEY) return next();
    return res.status(401).send('Unauthorized');
  }

  app.get('/admin/login', (_req: any, res: any) => {
    res.send(`
      <form method="POST" action="/admin/login" style="max-width:420px;margin:40px auto;font-family:system-ui">
        <h3>LeadPro Admin</h3>
        <input name="key" type="password" placeholder="Admin Key" style="width:100%;padding:10px" />
        <button style="margin-top:10px;padding:10px 14px">Login</button>
      </form>
    `);
  });

  app.post('/admin/login', (req: any, res: any) => {
    if (req.body?.key === ADMIN_KEY) {
      res.cookie('admin', ADMIN_KEY || '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7*24*60*60*1000
      });
      return res.redirect('/admin');
    }
    return res.status(401).send('Invalid key');
  });

  // Admin logout route
  app.get('/admin/logout', (_req: any, res: any) => {
    res.clearCookie('admin');
    res.redirect('/admin/login');
  });

  // Admin users page
  app.get('/admin/users', requireAdmin, async (_req: any, res: any) => {
    try {
      const users = await storage.getAllUsers();
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>User Management - LeadPro Admin</title>
          <style>
            body { font-family: system-ui; margin: 40px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .btn { background: #0079F2; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
            .users-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f8f9fa; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👥 User Management</h1>
              <a href="/admin" class="btn">← Back to Dashboard</a>
            </div>
            
            <div class="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${users.map(user => `
                    <tr>
                      <td>${user.firstName} ${user.lastName}</td>
                      <td>${user.email}</td>
                      <td>${user.companyName || 'Not set'}</td>
                      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <a href="/admin/users/${user.id}" class="btn" style="padding:5px 10px;font-size:12px;">View</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      res.send('<h2>User Management</h2><p>Loading users...</p><a href="/admin">Back to Dashboard</a>');
    }
  });

  app.get('/admin', requireAdmin, async (_req: any, res: any) => {
    try {
      // Get some basic stats for the admin dashboard
      const userCount = await storage.getUserCount();
      const leadCount = await storage.getLeadCount();
      const recentActivity = await storage.getRecentActivity();
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>LeadPro Admin Dashboard</title>
          <style>
            body { font-family: system-ui; margin: 40px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-number { font-size: 2em; font-weight: bold; color: #0079F2; }
            .actions { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .btn { background: #0079F2; color: white; padding: 10px 20px; border: none; border-radius: 4px; margin: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
            .btn:hover { background: #0056b3; }
            .btn-danger { background: #dc3545; }
            .btn-danger:hover { background: #c82333; }
            .activity { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
            .activity-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 LeadPro Admin Dashboard</h1>
              <p>Manage your lead generation platform</p>
              <a href="/admin/logout" class="btn btn-danger">Logout</a>
            </div>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-number">${userCount}</div>
                <div>Total Users</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${leadCount}</div>
                <div>Total Leads</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${recentActivity.length}</div>
                <div>Recent Activities</div>
              </div>
            </div>
            
            <div class="actions">
              <h3>Quick Actions</h3>
              <a href="/admin/users" class="btn">👥 Manage Users</a>
              <a href="/admin/leads" class="btn">📋 View All Leads</a>
              <a href="/admin/settings" class="btn">⚙️ System Settings</a>
              <a href="/admin/analytics" class="btn">📊 Analytics</a>
              <a href="/admin/backup" class="btn">💾 Backup Data</a>
            </div>
            
            <div class="activity">
              <h3>Recent Activity</h3>
              ${recentActivity.map(activity => `
                <div class="activity-item">
                  <strong>${activity.type}</strong> - ${activity.description}
                  <small style="color: #666; float: right;">${new Date(activity.timestamp).toLocaleString()}</small>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.send(`
        <div style="font-family:system-ui;max-width:600px;margin:40px auto;padding:20px;">
          <h2>🎯 LeadPro Admin Dashboard</h2>
          <p>Welcome to the admin panel! The dashboard is loading...</p>
          <div style="margin-top:20px;">
            <a href="/admin/users" style="background:#0079F2;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;margin:5px;">👥 Manage Users</a>
            <a href="/admin/settings" style="background:#0079F2;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;margin:5px;">⚙️ Settings</a>
            <a href="/admin/logout" style="background:#dc3545;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;margin:5px;">Logout</a>
          </div>
        </div>
      `);
    }
  });
}

startServer();