import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { mockProjects, mockUsers } from "./src/mockData";

const DATA_FILE = path.join(process.cwd(), "db_data.json");

// Helper to load/save data
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      return data;
    } catch (e) {
      console.error("Error loading data file, using defaults", e);
    }
  }
  return { projects: mockProjects, users: mockUsers };
}

function saveData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initial data load
  let { projects, users } = loadData();

  // API Routes
  app.get("/api/projects", (req, res) => {
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    projects = req.body;
    saveData({ projects, users });
    res.json({ success: true });
  });

  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/users", (req, res) => {
    users = req.body;
    saveData({ projects, users });
    res.json({ success: true });
  });

  // Vite middleware or production build serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
