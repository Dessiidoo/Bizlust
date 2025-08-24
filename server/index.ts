// server.ts (or index.ts if that's your entry)

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const ADMIN_KEY = process.env.ADMIN_KEY;

// --- Guard middleware ---
function requireAdmin(req: any, res: any, next: any) {
  if (!ADMIN_KEY) return res.status(500).send("Missing ADMIN_KEY");
  if (req.cookies?.admin === ADMIN_KEY) return next();
  return res.status(401).send("Unauthorized");
}

// --- Login page ---
app.get("/admin/login", (_req, res) => {
  res.send(`
    <form method="POST" action="/admin/login" style="max-width:420px;margin:40px auto;font-family:system-ui">
      <h3>LeadPro Admin</h3>
      <input name="key" type="password" placeholder="Admin Key" style="width:100%;padding:10px" />
      <button style="margin-top:10px;padding:10px;width:100%">Login</button>
    </form>
  `);
});

// --- Handle login ---
app.post("/admin/login", (req, res) => {
  const { key } = req.body;
  if (!ADMIN_KEY) return res.status(500).send("Missing ADMIN_KEY");
  if (key === ADMIN_KEY) {
    res.cookie("admin", ADMIN_KEY, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.redirect(303, "/admin");
  }
  res.status(401).send("Invalid key");
});

// --- Protected route ---
app.get("/admin", requireAdmin, (_req, res) => {
  res.send("Welcome to LeadPro Admin Dashboard 🚀");
});

// --- Decide between dev (Vite) or prod (static build) ---
async function start() {
  if (process.env.NODE_ENV === "production") {
    // serve built frontend
    const clientDir = path.join(__dirname, "dist/client"); // adjust if needed
    app.use(express.static(clientDir));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(clientDir, "index.html"))
    );
  } else {
    // dev mode: use Vite
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`[express] running on port ${PORT}`));
}

start();
