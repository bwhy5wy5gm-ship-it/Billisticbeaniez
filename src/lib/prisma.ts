import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "prisma", "dev.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initTables(_db);
  }
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
      UNIQUE(provider, providerAccountId)
    );

    CREATE TABLE IF NOT EXISTS Session (
      id TEXT PRIMARY KEY,
      sessionToken TEXT NOT NULL UNIQUE,
      userId TEXT NOT NULL,
      expires DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS VerificationToken (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires DATETIME NOT NULL,
      UNIQUE(identifier, token)
    );

    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      emailVerified DATETIME,
      image TEXT,
      hashedPassword TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      isAdmin INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS AdminSignupRequest (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS SensorData (
      id TEXT PRIMARY KEY,
      tank TEXT NOT NULL,
      co2 REAL NOT NULL,
      oxygen REAL NOT NULL,
      humidity REAL NOT NULL,
      temperature REAL NOT NULL,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ExperimentLog (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS SiteContent (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AccessLog (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      visitorId TEXT,
      userAgent TEXT,
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS SiteSettings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ProjectUpdate (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      photos TEXT NOT NULL DEFAULT '[]',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Feedback (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      person TEXT NOT NULL DEFAULT '',
      photos TEXT NOT NULL DEFAULT '[]',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PhotoLog (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      photos TEXT NOT NULL DEFAULT '[]',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ChartData (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      day INTEGER NOT NULL,
      co2Control REAL NOT NULL DEFAULT 0,
      co2Exp REAL NOT NULL DEFAULT 0,
      o2Control REAL NOT NULL DEFAULT 0,
      o2Exp REAL NOT NULL DEFAULT 0,
      tempControl REAL NOT NULL DEFAULT 0,
      tempExp REAL NOT NULL DEFAULT 0,
      humidityControl REAL NOT NULL DEFAULT 0,
      humidityExp REAL NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add missing columns for existing databases
  const addColumn = (table: string, col: string, type: string, def: string) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type} NOT NULL DEFAULT ${def}`);
    } catch {}
  };
  addColumn("ProjectUpdate", "company", "TEXT", "''");
  addColumn("ProjectUpdate", "person", "TEXT", "''");
  addColumn("Feedback", "company", "TEXT", "''");
  addColumn("Feedback", "person", "TEXT", "''");
}

function cuid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Query helpers that mirror the Prisma-like API used in the routes
// ---------------------------------------------------------------------------

function row<T = any>(sql: string, ...params: any[]): T | undefined {
  return getDb().prepare(sql).get(...params) as T | undefined;
}

function rows<T = any>(sql: string, ...params: any[]): T[] {
  return getDb().prepare(sql).all(...params) as T[];
}

function run(sql: string, ...params: any[]) {
  return getDb().prepare(sql).run(...params);
}

// ---------------------------------------------------------------------------
// Model accessors
// ---------------------------------------------------------------------------

const user = {
  findUnique(args: { where: { id?: string; email?: string } }) {
    if (args.where.id) return row("SELECT * FROM User WHERE id = ?", args.where.id);
    if (args.where.email) return row("SELECT * FROM User WHERE email = ?", args.where.email);
    return undefined;
  },
  findMany(args?: { orderBy?: { createdAt?: "asc" | "desc" } }) {
    return rows("SELECT * FROM User ORDER BY rowid DESC");
  },
  create(args: {
    data: {
      id?: string;
      name?: string;
      email: string;
      hashedPassword?: string;
      role?: string;
      isAdmin?: boolean;
      image?: string;
    };
  }) {
    const id = args.data.id || cuid();
    run(
      "INSERT INTO User (id, name, email, hashedPassword, role, isAdmin) VALUES (?, ?, ?, ?, ?, ?)",
      id,
      args.data.name || null,
      args.data.email,
      args.data.hashedPassword || null,
      args.data.role || "user",
      args.data.isAdmin ? 1 : 0,
    );
    return user.findUnique({ where: { id } });
  },
  update(args: {
    where: { id: string };
    data: Record<string, any>;
  }) {
    const fields = Object.keys(args.data);
    const set = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => {
      const v = args.data[f];
      if (typeof v === "boolean") return v ? 1 : 0;
      return v ?? null;
    });
    run(`UPDATE User SET ${set} WHERE id = ?`, ...values, args.where.id);
    return user.findUnique({ where: { id: args.where.id } });
  },
  delete(args: { where: { id: string } }) {
    run("DELETE FROM User WHERE id = ?", args.where.id);
  },
  count() {
    return (row<{ c: number }>("SELECT COUNT(*) as c FROM User")?.c) ?? 0;
  },
};

const adminSignupRequest = {
  findUnique(args: { where: { id: string } }) {
    return row("SELECT * FROM AdminSignupRequest WHERE id = ?", args.where.id);
  },
  findFirst(args?: { where?: { email?: string; status?: string }; orderBy?: any }) {
    let sql = "SELECT * FROM AdminSignupRequest WHERE 1=1";
    const params: any[] = [];
    if (args?.where?.email) { sql += " AND email = ?"; params.push(args.where.email); }
    if (args?.where?.status) { sql += " AND status = ?"; params.push(args.where.status); }
    sql += " ORDER BY rowid DESC LIMIT 1";
    return row(sql, ...params);
  },
  findMany(args?: { where?: { status?: string }; orderBy?: { createdAt?: "asc" | "desc" } }) {
    let sql = "SELECT * FROM AdminSignupRequest WHERE 1=1";
    const params: any[] = [];
    if (args?.where?.status) { sql += " AND status = ?"; params.push(args.where.status); }
    sql += " ORDER BY createdAt DESC";
    return rows(sql, ...params);
  },
  create(args: { data: { name: string; email: string; reason: string; status?: string } }) {
    const id = cuid();
    run(
      "INSERT INTO AdminSignupRequest (id, name, email, reason, status) VALUES (?, ?, ?, ?, ?)",
      id,
      args.data.name,
      args.data.email,
      args.data.reason,
      args.data.status || "pending",
    );
    return adminSignupRequest.findUnique({ where: { id } });
  },
  update(args: { where: { id: string }; data: { status: string } }) {
    run("UPDATE AdminSignupRequest SET status = ?, updatedAt = ? WHERE id = ?", args.data.status, now(), args.where.id);
    return adminSignupRequest.findUnique({ where: { id: args.where.id } });
  },
};

const sensorData = {
  findFirst(args?: { where?: { tank?: string }; orderBy?: { timestamp?: "desc" } }) {
    let sql = "SELECT * FROM SensorData WHERE 1=1";
    const params: any[] = [];
    if (args?.where?.tank) { sql += " AND tank = ?"; params.push(args.where.tank); }
    sql += " ORDER BY timestamp DESC LIMIT 1";
    return row(sql, ...params);
  },
  create(args: { data: { tank: string; co2: number; oxygen: number; humidity: number; temperature: number } }) {
    const id = cuid();
    run(
      "INSERT INTO SensorData (id, tank, co2, oxygen, humidity, temperature) VALUES (?, ?, ?, ?, ?, ?)",
      id,
      args.data.tank,
      args.data.co2,
      args.data.oxygen,
      args.data.humidity,
      args.data.temperature,
    );
    return sensorData.findFirst({ where: { tank: args.data.tank } });
  },
};

const siteContent = {
  findMany() {
    return rows("SELECT * FROM SiteContent");
  },
  findUnique(args: { where: { key: string } }) {
    return row("SELECT * FROM SiteContent WHERE key = ?", args.where.key);
  },
  upsert(args: { where: { key: string }; update: { value: string }; create: { key: string; value: string } }) {
    const existing = siteContent.findUnique({ where: { key: args.where.key } });
    if (existing) {
      run("UPDATE SiteContent SET value = ? WHERE key = ?", args.update.value, args.where.key);
    } else {
      run("INSERT INTO SiteContent (id, key, value) VALUES (?, ?, ?)", cuid(), args.create.key, args.create.value);
    }
    return siteContent.findUnique({ where: { key: args.where.key } });
  },
  create(args: { data: { key: string; value: string } }) {
    const existing = siteContent.findUnique({ where: { key: args.data.key } });
    if (existing) return existing;
    run("INSERT INTO SiteContent (id, key, value) VALUES (?, ?, ?)", cuid(), args.data.key, args.data.value);
    return siteContent.findUnique({ where: { key: args.data.key } });
  },
};

const siteSettings = {
  findMany() {
    return rows("SELECT * FROM SiteSettings");
  },
  findUnique(args: { where: { key: string } }) {
    return row("SELECT * FROM SiteSettings WHERE key = ?", args.where.key);
  },
  upsert(args: { where: { key: string }; update: { value: string }; create: { key: string; value: string } }) {
    const existing = siteSettings.findUnique({ where: { key: args.where.key } });
    if (existing) {
      run("UPDATE SiteSettings SET value = ? WHERE key = ?", args.update.value, args.where.key);
    } else {
      run("INSERT INTO SiteSettings (id, key, value) VALUES (?, ?, ?)", cuid(), args.create.key, args.create.value);
    }
    return siteSettings.findUnique({ where: { key: args.where.key } });
  },
  create(args: { data: { key: string; value: string } }) {
    const existing = siteSettings.findUnique({ where: { key: args.data.key } });
    if (existing) return existing;
    run("INSERT INTO SiteSettings (id, key, value) VALUES (?, ?, ?)", cuid(), args.data.key, args.data.value);
    return siteSettings.findUnique({ where: { key: args.data.key } });
  },
};

const accessLog = {
  findMany(args?: { where?: { page?: string }; orderBy?: { timestamp?: "desc" }; take?: number }) {
    let sql = "SELECT * FROM AccessLog WHERE 1=1";
    const params: any[] = [];
    if (args?.where?.page) { sql += " AND page = ?"; params.push(args.where.page); }
    sql += " ORDER BY timestamp DESC";
    if (args?.take) { sql += ` LIMIT ${args.take}`; }
    return rows(sql, ...params);
  },
  create(args: { data: { page: string; visitorId?: string; userAgent?: string } }) {
    const id = cuid();
    run(
      "INSERT INTO AccessLog (id, page, visitorId, userAgent) VALUES (?, ?, ?, ?)",
      id,
      args.data.page,
      args.data.visitorId || null,
      args.data.userAgent || null,
    );
    return { id };
  },
  groupBy(args: { by: string[]; _count: true }) {
    const field = args.by[0];
    return rows(`SELECT ${field}, COUNT(*) as _count FROM AccessLog GROUP BY ${field}`);
  },
};

const experimentLog = {
  findMany(args?: { orderBy?: { createdAt?: "asc" | "desc" } }) {
    return rows("SELECT * FROM ExperimentLog ORDER BY createdAt DESC");
  },
  create(args: { data: { title: string; content: string; author: string } }) {
    const id = cuid();
    run(
      "INSERT INTO ExperimentLog (id, title, content, author) VALUES (?, ?, ?, ?)",
      id,
      args.data.title,
      args.data.content,
      args.data.author,
    );
    return experimentLog.findMany();
  },
};

const projectUpdate = {
  findMany() {
    return rows("SELECT * FROM ProjectUpdate ORDER BY createdAt DESC");
  },
  findUnique(args: { where: { id: string } }) {
    return row("SELECT * FROM ProjectUpdate WHERE id = ?", args.where.id);
  },
  create(args: {
    data: { title: string; description: string; date: string; photos?: string[] };
  }) {
    const id = cuid();
    run(
      "INSERT INTO ProjectUpdate (id, title, description, date, photos) VALUES (?, ?, ?, ?, ?)",
      id,
      args.data.title,
      args.data.description,
      args.data.date,
      JSON.stringify(args.data.photos || []),
    );
    return projectUpdate.findUnique({ where: { id } });
  },
  update(args: {
    where: { id: string };
    data: { title?: string; description?: string; date?: string; photos?: string[] };
  }) {
    const existing = projectUpdate.findUnique({ where: args.where });
    if (!existing) return null;
    const data = args.data;
    run(
      "UPDATE ProjectUpdate SET title = ?, description = ?, date = ?, photos = ?, updatedAt = ? WHERE id = ?",
      data.title ?? existing.title,
      data.description ?? existing.description,
      data.date ?? existing.date,
      JSON.stringify(data.photos ?? JSON.parse((existing as any).photos || "[]")),
      now(),
      args.where.id,
    );
    return projectUpdate.findUnique({ where: args.where });
  },
  delete(args: { where: { id: string } }) {
    run("DELETE FROM ProjectUpdate WHERE id = ?", args.where.id);
  },
};

const feedback = {
  findMany() {
    return rows("SELECT * FROM Feedback ORDER BY createdAt DESC");
  },
  findUnique(args: { where: { id: string } }) {
    return row("SELECT * FROM Feedback WHERE id = ?", args.where.id);
  },
  create(args: {
    data: { title: string; description: string; date: string; company?: string; person?: string; photos?: string[] };
  }) {
    const id = cuid();
    run(
      "INSERT INTO Feedback (id, title, description, date, company, person, photos) VALUES (?, ?, ?, ?, ?, ?, ?)",
      id,
      args.data.title,
      args.data.description,
      args.data.date,
      args.data.company || "",
      args.data.person || "",
      JSON.stringify(args.data.photos || []),
    );
    return feedback.findUnique({ where: { id } });
  },
  update(args: {
    where: { id: string };
    data: { title?: string; description?: string; date?: string; company?: string; person?: string; photos?: string[] };
  }) {
    const existing = feedback.findUnique({ where: args.where });
    if (!existing) return null;
    const data = args.data;
    run(
      "UPDATE Feedback SET title = ?, description = ?, date = ?, company = ?, person = ?, photos = ?, updatedAt = ? WHERE id = ?",
      data.title ?? existing.title,
      data.description ?? existing.description,
      data.date ?? existing.date,
      data.company ?? (existing as any).company,
      data.person ?? (existing as any).person,
      JSON.stringify(data.photos ?? JSON.parse((existing as any).photos || "[]")),
      now(),
      args.where.id,
    );
    return feedback.findUnique({ where: args.where });
  },
  delete(args: { where: { id: string } }) {
    run("DELETE FROM Feedback WHERE id = ?", args.where.id);
  },
};

const photoLog = {
  findMany() {
    return rows("SELECT * FROM PhotoLog ORDER BY createdAt DESC");
  },
  findUnique(args: { where: { id: string } }) {
    return row("SELECT * FROM PhotoLog WHERE id = ?", args.where.id);
  },
  create(args: {
    data: { title: string; description?: string; date: string; photos?: string[] };
  }) {
    const id = cuid();
    run(
      "INSERT INTO PhotoLog (id, title, description, date, photos) VALUES (?, ?, ?, ?, ?)",
      id,
      args.data.title,
      args.data.description || "",
      args.data.date,
      JSON.stringify(args.data.photos || []),
    );
    return photoLog.findUnique({ where: { id } });
  },
  update(args: {
    where: { id: string };
    data: { title?: string; description?: string; date?: string; photos?: string[] };
  }) {
    const existing = photoLog.findUnique({ where: args.where });
    if (!existing) return null;
    const data = args.data;
    run(
      "UPDATE PhotoLog SET title = ?, description = ?, date = ?, photos = ?, updatedAt = ? WHERE id = ?",
      data.title ?? existing.title,
      data.description ?? existing.description,
      data.date ?? existing.date,
      JSON.stringify(data.photos ?? JSON.parse((existing as any).photos || "[]")),
      now(),
      args.where.id,
    );
    return photoLog.findUnique({ where: args.where });
  },
  delete(args: { where: { id: string } }) {
    run("DELETE FROM PhotoLog WHERE id = ?", args.where.id);
  },
};

const chartData = {
  findMany() {
    return rows("SELECT * FROM ChartData ORDER BY day ASC");
  },
  findUnique(args: { where: { id: string } }) {
    return row("SELECT * FROM ChartData WHERE id = ?", args.where.id);
  },
  create(args: {
    data: { label: string; day: number; co2Control: number; co2Exp: number; o2Control: number; o2Exp: number; tempControl: number; tempExp: number; humidityControl: number; humidityExp: number };
  }) {
    const id = cuid();
    run(
      "INSERT INTO ChartData (id, label, day, co2Control, co2Exp, o2Control, o2Exp, tempControl, tempExp, humidityControl, humidityExp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      id, args.data.label, args.data.day, args.data.co2Control, args.data.co2Exp, args.data.o2Control, args.data.o2Exp, args.data.tempControl, args.data.tempExp, args.data.humidityControl, args.data.humidityExp,
    );
    return chartData.findUnique({ where: { id } });
  },
  update(args: {
    where: { id: string };
    data: { label?: string; day?: number; co2Control?: number; co2Exp?: number; o2Control?: number; o2Exp?: number; tempControl?: number; tempExp?: number; humidityControl?: number; humidityExp?: number };
  }) {
    const existing = chartData.findUnique({ where: args.where });
    if (!existing) return null;
    const d = args.data;
    run(
      "UPDATE ChartData SET label=?, day=?, co2Control=?, co2Exp=?, o2Control=?, o2Exp=?, tempControl=?, tempExp=?, humidityControl=?, humidityExp=? WHERE id=?",
      d.label ?? (existing as any).label, d.day ?? (existing as any).day,
      d.co2Control ?? (existing as any).co2Control, d.co2Exp ?? (existing as any).co2Exp,
      d.o2Control ?? (existing as any).o2Control, d.o2Exp ?? (existing as any).o2Exp,
      d.tempControl ?? (existing as any).tempControl, d.tempExp ?? (existing as any).tempExp,
      d.humidityControl ?? (existing as any).humidityControl, d.humidityExp ?? (existing as any).humidityExp,
      args.where.id,
    );
    return chartData.findUnique({ where: args.where });
  },
  delete(args: { where: { id: string } }) {
    run("DELETE FROM ChartData WHERE id = ?", args.where.id);
  },
  deleteAll() {
    run("DELETE FROM ChartData");
  },
};

// ---------------------------------------------------------------------------
// Export a Prisma-like API surface
// ---------------------------------------------------------------------------

export const prisma = {
  user,
  adminSignupRequest,
  sensorData,
  siteContent,
  siteSettings,
  accessLog,
  experimentLog,
  projectUpdate,
  feedback,
  photoLog,
  chartData,
  getDb,
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
};
