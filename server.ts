import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "workhub.db"));

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    password TEXT,
    role TEXT,
    department TEXT,
    position TEXT,
    branch TEXT,
    joining_date TEXT,
    birth_date TEXT,
    location TEXT,
    phone TEXT,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    client TEXT,
    department TEXT,
    type TEXT,
    status TEXT,
    assigned_to TEXT,
    records_required INTEGER,
    records_completed INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity_feed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id TEXT,
    receiver_id TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userName TEXT,
    type TEXT,
    startDate TEXT,
    endDate TEXT,
    reason TEXT,
    status TEXT,
    appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS query_risks (
    id TEXT PRIMARY KEY,
    userId TEXT,
    userName TEXT,
    type TEXT,
    title TEXT,
    description TEXT,
    priority TEXT,
    status TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    message TEXT,
    sender TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    title TEXT,
    message TEXT,
    type TEXT,
    isRead INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_content (
    date TEXT PRIMARY KEY,
    content TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    date TEXT,
    loginTime TEXT,
    logoutTime TEXT,
    status TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    date TEXT,
    time TEXT,
    type TEXT
  );
`);

// Migration: Ensure columns exist (better-sqlite3 CREATE TABLE IF NOT EXISTS doesn't add columns to existing tables)
const tables = {
  chat_messages: ['sender_id', 'receiver_id', 'message', 'timestamp'],
  notifications: ['userId', 'title', 'message', 'type', 'isRead', 'timestamp'],
  attendance: ['userId', 'date', 'loginTime', 'logoutTime', 'status'],
  events: ['title', 'description', 'date', 'time', 'type']
};

for (const [table, columns] of Object.entries(tables)) {
  const info = db.pragma(`table_info(${table})`) as any[];
  const existingColumns = info.map(c => c.name);
  
  for (const col of columns) {
    if (!existingColumns.includes(col)) {
      try {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`);
        console.log(`Added missing column ${col} to ${table}`);
      } catch (e) {
        console.error(`Failed to add column ${col} to ${table}:`, e);
      }
    }
  }
}

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, password, role, department, position, branch, joining_date, birth_date, location, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run("MIS1001", "Parameswari V", "technotask@123", "Employee", "Client Data MIS", "MIS Architect", "Technotask Mysore", "2025-01-15", "1998-05-20", "Erode, Tamil Nadu", "9976170606", "mail2paramubtech@gmail.com");
  insertUser.run("MIS1002", "R Karthik", "technotask@123", "Employee", "Sales MIS", "Senior MIS Analyst", "Technotask Bangalore", "2024-05-20", "1995-10-12", "Bangalore, Karnataka", "9876543210", "karthik@technotask.com");
  insertUser.run("MIS1003", "Divya S", "technotask@123", "Employee", "Operations MIS", "MIS Specialist", "Technotask Mysore", "2024-11-10", "1997-03-15", "Mysore, Karnataka", "9123456789", "divya@technotask.com");
  insertUser.run("MIS1004", "Naveen Kumar", "technotask@123", "Employee", "Customer Support MIS", "MIS Associate", "Technotask Mysore", "2025-02-01", "1999-08-25", "Mysore, Karnataka", "9000000001", "naveen@technotask.com");
  insertUser.run("ADMIN001", "Admin User", "admin123", "Admin", "Management", "Operations Head", "Technotask HQ", "2020-01-01", "1985-01-01", "Bhopal, MP", "1234567890", "admin@technotask.com");

  // Seed some attendance
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (userId, date, loginTime, logoutTime, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Seed attendance for the last 10 days
  for (let i = 0; i < 10; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
      const dateStr = d.toISOString().split('T')[0];
      const loginTime = `09:${Math.floor(Math.random() * 30).toString().padStart(2, '0')} AM`;
      const logoutTime = `06:${Math.floor(Math.random() * 30).toString().padStart(2, '0')} PM`;
      insertAttendance.run("MIS1001", dateStr, loginTime, logoutTime, "Present");
    }
  }

  // Seed some events
  const insertEvent = db.prepare(`
    INSERT INTO events (title, description, date, time, type)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertEvent.run("Monthly Review Meeting", "Reviewing February performance and March goals.", today, "11:00 AM", "Meeting");
  insertEvent.run("Team Outing", "Fun activities and dinner.", "2026-03-15", "05:00 PM", "Event");
  insertEvent.run("Client Presentation", "Presenting Q1 data to the client.", "2026-03-12", "02:00 PM", "Meeting");
  insertEvent.run("Tech Workshop", "Learning new MIS tools.", "2026-03-20", "10:00 AM", "Workshop");
  insertEvent.run("Project Deadline", "Final submission of the data migration project.", "2026-03-25", "06:00 PM", "Deadline");
  insertEvent.run("Weekly Sync", "Regular team sync-up.", "2026-03-11", "10:00 AM", "Meeting");
  insertEvent.run("Weekly Sync", "Regular team sync-up.", "2026-03-18", "10:00 AM", "Meeting");
  insertEvent.run("Weekly Sync", "Regular team sync-up.", "2026-03-25", "10:00 AM", "Meeting");

  // Seed some leave requests
  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (id, userId, userName, type, startDate, endDate, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertLeave.run("L001", "MIS1001", "Parameswari V", "Leave", "2026-03-15", "2026-03-16", "Family function in Erode", "Pending");
  insertLeave.run("L002", "MIS1003", "Divya S", "Permission", "2026-03-10", "2026-03-10", "Personal work", "Pending");

  // Seed some risks
  const insertRisk = db.prepare(`
    INSERT INTO query_risks (id, userId, userName, type, title, description, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertRisk.run("R001", "MIS1001", "Parameswari V", "Risk", "Flipkart Data Delay", "Flipkart API is responding slowly, might delay the daily MIS report.", "High", "Open");

  // Seed some activity
  const insertActivity = db.prepare("INSERT INTO activity_feed (user_id, message) VALUES (?, ?)");
  insertActivity.run("SYSTEM", "Technotask WorkHub System Initialized.");
  insertActivity.run("SYSTEM", "Welcome to the new MIS Management Portal.");
  insertActivity.run("MIS1001", "Parameswari V logged in.");
}

async function startServer() {
  const app = express();
  const apiRouter = express.Router();
  
  // Global Request Logging
  app.use((req, res, next) => {
    if (!req.url.startsWith('/@') && !req.url.includes('node_modules')) {
      console.log(`[Server] ${req.method} ${req.url}`);
    }
    next();
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Global Request Logging
  apiRouter.use((req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.originalUrl}`);
    next();
  });

  apiRouter.get(["/health", "/health/"], (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  apiRouter.post(["/login", "/login/"], (req, res) => {
    try {
      const { employeeId, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE id = ? AND password = ?").get(employeeId, password);
      if (user) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/tasks/:userId", "/tasks/:userId/"], (req, res) => {
    try {
      const tasks = db.prepare("SELECT * FROM tasks WHERE assigned_to = ? OR assigned_to = 'ALL'").all(req.params.userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/activity", "/activity/"], (req, res) => {
    console.log("Fetching activity feed...");
    try {
      const feed = db.prepare("SELECT * FROM activity_feed ORDER BY timestamp DESC LIMIT 20").all();
      res.json(feed);
    } catch (error: any) {
      console.error("Activity feed error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/leaves/:userId", "/leaves/:userId/"], (req, res) => {
    try {
      const leaves = db.prepare("SELECT * FROM leave_requests WHERE userId = ? ORDER BY appliedAt DESC").all(req.params.userId);
      res.json(leaves);
    } catch (error: any) {
      console.error(`Error fetching leaves for ${req.params.userId}:`, error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/leaves", "/leaves/"], (req, res) => {
    try {
      const { userId, userName, type, startDate, endDate, reason } = req.body;
      const id = `LR-${Math.floor(1000 + Math.random() * 9000)}`;
      db.prepare("INSERT INTO leave_requests (id, userId, userName, type, startDate, endDate, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, userId, userName, type, startDate, endDate, reason, "Pending");
      res.json({ success: true, id });
    } catch (error: any) {
      console.error("Error creating leave request:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/risks/:userId", "/risks/:userId/"], (req, res) => {
    try {
      const risks = db.prepare("SELECT * FROM query_risks WHERE userId = ? ORDER BY createdAt DESC").all(req.params.userId);
      res.json(risks);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/admin/leaves", "/admin/leaves/"], (req, res) => {
    try {
      const leaves = db.prepare("SELECT * FROM leave_requests ORDER BY appliedAt DESC").all();
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/admin/leaves/:id/status", "/admin/leaves/:id/status/"], (req, res) => {
    try {
      const { status } = req.body;
      db.prepare("UPDATE leave_requests SET status = ? WHERE id = ?").run(status, req.params.id);
      
      // Notify user
      const leave = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(req.params.id) as any;
      if (leave) {
        db.prepare("INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)")
          .run(leave.userId, `Leave ${status}`, `Your ${leave.type} request has been ${status.toLowerCase()}.`, "system");
        io.to(leave.userId).emit("new_notification", { title: `Leave ${status}`, message: `Your ${leave.type} request has been ${status.toLowerCase()}.` });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/admin/risks", "/admin/risks/"], (req, res) => {
    try {
      const risks = db.prepare("SELECT * FROM query_risks ORDER BY createdAt DESC").all();
      res.json(risks);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/admin/risks/:id/status", "/admin/risks/:id/status/"], (req, res) => {
    try {
      const { status } = req.body;
      db.prepare("UPDATE query_risks SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/admin/risks", "/admin/risks/"], (req, res) => {
    try {
      const { title, description, type, priority, assignedTo, status, userId, userName } = req.body;
      const id = `QR-${Math.floor(1000 + Math.random() * 9000)}`;
      db.prepare("INSERT INTO query_risks (id, userId, userName, title, description, type, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, userId || "SYSTEM", userName || "System", title, description, type, priority, status || "Open");
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/admin/risks/:id/reallocate", "/admin/risks/:id/reallocate/"], (req, res) => {
    try {
      const { assignedTo } = req.body;
      db.prepare("UPDATE query_risks SET userName = ? WHERE id = ?").run(assignedTo, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/admin/announcements", "/admin/announcements/"], (req, res) => {
    try {
      const { title, message, sender } = req.body;
      db.prepare("INSERT INTO announcements (title, message, sender) VALUES (?, ?, ?)").run(title, message, sender);
      
      // Notify ALL users
      const users = db.prepare("SELECT id FROM users").all() as any[];
      users.forEach(u => {
        db.prepare("INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)")
          .run(u.id, title, message, "announcement");
      });
      
      io.emit("new_announcement", { title, message, sender, timestamp: new Date().toISOString() });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/notifications/:userId", "/notifications/:userId/"], (req, res) => {
    console.log(`Fetching notifications for user: ${req.params.userId}`);
    try {
      const notifications = db.prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC").all(req.params.userId);
      res.json(notifications);
    } catch (error: any) {
      console.error("Notifications error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/notifications/read", "/notifications/read/"], (req, res) => {
    try {
      const { userId } = req.body;
      db.prepare("UPDATE notifications SET isRead = 1 WHERE userId = ?").run(userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/attendance/:userId", "/attendance/:userId/"], (req, res) => {
    try {
      const attendance = db.prepare("SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC").all(req.params.userId);
      res.json(attendance);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/events", "/events/"], (req, res) => {
    try {
      const events = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/users/names", "/users/names/"], (req, res) => {
    try {
      const users = db.prepare("SELECT name FROM users").all();
      res.json(users.map((u: any) => u.name));
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/users/birthdays", "/users/birthdays/"], (req, res) => {
    try {
      const today = new Date().toISOString().slice(5, 10); // MM-DD
      const birthdays = db.prepare("SELECT name, birth_date FROM users WHERE birth_date LIKE ?").all(`%-${today}`);
      res.json(birthdays);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/daily-content", "/daily-content/"], (req, res) => {
    try {
      const { date } = req.query;
      const content = db.prepare("SELECT content FROM daily_content WHERE date = ?").get(date);
      if (content) {
        res.json(JSON.parse((content as any).content));
      } else {
        res.status(404).json({ error: "No content for this date" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.post(["/daily-content", "/daily-content/"], (req, res) => {
    try {
      const { date, content } = req.body;
      db.prepare("INSERT OR REPLACE INTO daily_content (date, content) VALUES (?, ?)").run(date, JSON.stringify(content));
      
      // Also create actual announcements from this content if it's new
      if (content.announcements) {
        content.announcements.forEach((ann: any) => {
          const exists = db.prepare("SELECT id FROM announcements WHERE title = ? AND timestamp LIKE ?").get(ann.title, `${date}%`);
          if (!exists) {
            db.prepare("INSERT INTO announcements (title, message, sender) VALUES (?, ?, ?)").run(ann.title, ann.message, "AI Assistant");
            
            // Notify all users
            const users = db.prepare("SELECT id FROM users").all() as any[];
            users.forEach(u => {
              db.prepare("INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)")
                .run(u.id, ann.title, ann.message, "announcement");
            });
          }
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/chat/history/:user1/:user2", "/chat/history/:user1/:user2/"], (req, res) => {
    console.log(`Fetching chat history: ${req.params.user1} <-> ${req.params.user2}`);
    try {
      const { user1, user2 } = req.params;
      const messages = db.prepare(`
        SELECT id, sender_id as senderId, receiver_id as receiverId, message, timestamp 
        FROM chat_messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp ASC
      `).all(user1, user2, user2, user1);
      res.json(messages);
    } catch (error: any) {
      console.error("Chat history error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.get(["/insight", "/insight/"], (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const content = db.prepare("SELECT content FROM daily_content WHERE date = ?").get(today);
      if (content) {
        res.json(JSON.parse((content as any).content).insight);
      } else {
        res.status(404).json({ error: "No insight for today" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  apiRouter.all("*", (req, res) => {
    console.warn(`404 API Route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  apiRouter.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Router Error:", err);
    res.status(500).json({ success: false, message: "API Internal Server Error", error: err.message });
  });

  app.use("/api", apiRouter);

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  });

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("send_message", (data) => {
      const { senderId, receiverId, message } = data;
      const result = db.prepare("INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)").run(senderId, receiverId, message);
      
      // Emit to both sender and receiver rooms
      io.to(senderId).to(receiverId).emit("new_message", { 
        id: result.lastInsertRowid,
        senderId, 
        receiverId, 
        message, 
        timestamp: new Date().toISOString() 
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Simulation: Generate dummy data periodically
  setInterval(() => {
    const clients = ["Amazon", "Flipkart", "Zomato", "Swiggy", "Myntra"];
    const issues = ["Refund Pending", "Delivery Delay", "Payment Failed", "Wrong Item", "Account Blocked"];
    const client = clients[Math.floor(Math.random() * clients.length)];
    const issue = issues[Math.floor(Math.random() * issues.length)];
    const timestamp = new Date().toLocaleTimeString();
    
    const message = `New ${client} MIS entry: ${issue} at ${timestamp}`;
    db.prepare("INSERT INTO activity_feed (user_id, message) VALUES (?, ?)").run("SYSTEM", message);
    io.emit("activity_update", { message, timestamp: new Date().toISOString() });
  }, 60000); // Every minute for demo purposes

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
