const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the built frontend from dist/public
app.use(express.static(path.join(__dirname, "dist/public")));

// React Router / SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
