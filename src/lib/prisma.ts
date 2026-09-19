import { createClient, SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

let _supabase: SupabaseClient | null = null;

function getDb(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    _supabase = createClient(url, key);
  }
  return _supabase;
}

function cuid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c";
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ---------------------------------------------------------------------------
// Model accessors using Supabase REST API
// ---------------------------------------------------------------------------

const user = {
  async findUnique(args: { where: { id?: string; email?: string } }) {
    const db = getDb();
    if (args.where.id) {
      const { data } = await db.from("User").select("*").eq("id", args.where.id).single();
      return data;
    }
    if (args.where.email) {
      const { data } = await db.from("User").select("*").eq("email", args.where.email).single();
      return data;
    }
    return undefined;
  },
  async findMany() {
    const { data } = await getDb().from("User").select("*").order("id", { ascending: false });
    return data || [];
  },
  async create(args: {
    data: { id?: string; name?: string; email: string; hashedPassword?: string; role?: string; isAdmin?: boolean; image?: string };
  }) {
    const id = args.data.id || cuid();
    const { error } = await getDb().from("User").insert({
      id, name: args.data.name || null, email: args.data.email,
      hashedPassword: args.data.hashedPassword || null,
      role: args.data.role || "user", isAdmin: args.data.isAdmin ? 1 : 0,
    });
    if (error) throw new Error(error.message);
    return user.findUnique({ where: { id } });
  },
  async update(args: { where: { id: string }; data: Record<string, any> }) {
    const updateData: Record<string, any> = {};
    for (const [k, v] of Object.entries(args.data)) {
      updateData[k] = typeof v === "boolean" ? (v ? 1 : 0) : (v ?? null);
    }
    const { error } = await getDb().from("User").update(updateData).eq("id", args.where.id);
    if (error) throw new Error(error.message);
    return user.findUnique({ where: { id: args.where.id } });
  },
  async delete(args: { where: { id: string } }) {
    await getDb().from("User").delete().eq("id", args.where.id);
  },
  async count() {
    const { count } = await getDb().from("User").select("*", { count: "exact", head: true });
    return count || 0;
  },
};

const adminSignupRequest = {
  async findUnique(args: { where: { id: string } }) {
    const { data } = await getDb().from("AdminSignupRequest").select("*").eq("id", args.where.id).single();
    return data;
  },
  async findFirst(args?: { where?: { email?: string; status?: string } }) {
    let q = getDb().from("AdminSignupRequest").select("*");
    if (args?.where?.email) q = q.eq("email", args.where.email);
    if (args?.where?.status) q = q.eq("status", args.where.status);
    const { data } = await q.order("createdAt", { ascending: false }).limit(1).single();
    return data;
  },
  async findMany(args?: { where?: { status?: string } }) {
    let q = getDb().from("AdminSignupRequest").select("*");
    if (args?.where?.status) q = q.eq("status", args.where.status);
    const { data } = await q.order("createdAt", { ascending: false });
    return data || [];
  },
  async create(args: { data: { name: string; email: string; reason: string; status?: string } }) {
    const id = cuid();
    const { error } = await getDb().from("AdminSignupRequest").insert({
      id, name: args.data.name, email: args.data.email,
      reason: args.data.reason, status: args.data.status || "pending",
    });
    if (error) throw new Error(error.message);
    return adminSignupRequest.findUnique({ where: { id } });
  },
  async update(args: { where: { id: string }; data: { status: string } }) {
    await getDb().from("AdminSignupRequest").update({ status: args.data.status, updatedAt: new Date().toISOString() }).eq("id", args.where.id);
    return adminSignupRequest.findUnique({ where: { id: args.where.id } });
  },
};

const sensorData = {
  async findFirst(args?: { where?: { tank?: string } }) {
    let q = getDb().from("SensorData").select("*");
    if (args?.where?.tank) q = q.eq("tank", args.where.tank);
    const { data } = await q.order("timestamp", { ascending: false }).limit(1).single();
    return data;
  },
  async create(args: { data: { tank: string; co2: number; oxygen: number; humidity: number; temperature: number } }) {
    const id = cuid();
    const { error } = await getDb().from("SensorData").insert({
      id, tank: args.data.tank, co2: args.data.co2,
      oxygen: args.data.oxygen, humidity: args.data.humidity, temperature: args.data.temperature,
    });
    if (error) throw new Error(error.message);
    return sensorData.findFirst({ where: { tank: args.data.tank } });
  },
};

const siteContent = {
  async findMany() {
    const { data } = await getDb().from("SiteContent").select("*");
    return data || [];
  },
  async findUnique(args: { where: { key: string } }) {
    const { data } = await getDb().from("SiteContent").select("*").eq("key", args.where.key).single();
    return data;
  },
  async upsert(args: { where: { key: string }; update: { value: string }; create: { key: string; value: string } }) {
    const existing = await siteContent.findUnique({ where: { key: args.where.key } });
    if (existing) {
      await getDb().from("SiteContent").update({ value: args.update.value }).eq("key", args.where.key);
    } else {
      await getDb().from("SiteContent").insert({ id: cuid(), key: args.create.key, value: args.create.value });
    }
    return siteContent.findUnique({ where: { key: args.where.key } });
  },
  async create(args: { data: { key: string; value: string } }) {
    const existing = await siteContent.findUnique({ where: { key: args.data.key } });
    if (existing) return existing;
    await getDb().from("SiteContent").insert({ id: cuid(), key: args.data.key, value: args.data.value });
    return siteContent.findUnique({ where: { key: args.data.key } });
  },
};

const siteSettings = {
  async findMany() {
    const { data } = await getDb().from("SiteSettings").select("*");
    return data || [];
  },
  async findUnique(args: { where: { key: string } }) {
    const { data } = await getDb().from("SiteSettings").select("*").eq("key", args.where.key).single();
    return data;
  },
  async upsert(args: { where: { key: string }; update: { value: string }; create: { key: string; value: string } }) {
    const existing = await siteSettings.findUnique({ where: { key: args.where.key } });
    if (existing) {
      await getDb().from("SiteSettings").update({ value: args.update.value }).eq("key", args.where.key);
    } else {
      await getDb().from("SiteSettings").insert({ id: cuid(), key: args.create.key, value: args.create.value });
    }
    return siteSettings.findUnique({ where: { key: args.where.key } });
  },
};

const accessLog = {
  async findMany(args?: { where?: { page?: string }; take?: number }) {
    let q = getDb().from("AccessLog").select("*");
    if (args?.where?.page) q = q.eq("page", args.where.page);
    q = q.order("timestamp", { ascending: false });
    if (args?.take) q = q.limit(args.take);
    const { data } = await q;
    return data || [];
  },
  async create(args: { data: { page: string; visitorId?: string; userAgent?: string } }) {
    const id = cuid();
    await getDb().from("AccessLog").insert({
      id, page: args.data.page, visitorId: args.data.visitorId || null, userAgent: args.data.userAgent || null,
    });
    return { id };
  },
};

const experimentLog = {
  async findMany() {
    const { data } = await getDb().from("ExperimentLog").select("*").order("createdAt", { ascending: false });
    return data || [];
  },
  async create(args: { data: { title: string; content: string; author: string } }) {
    const id = cuid();
    await getDb().from("ExperimentLog").insert({
      id, title: args.data.title, content: args.data.content, author: args.data.author,
    });
    return experimentLog.findMany();
  },
};

const projectUpdate = {
  async findMany() {
    const { data } = await getDb().from("ProjectUpdate").select("*").order("createdAt", { ascending: false });
    return data || [];
  },
  async findUnique(args: { where: { id: string } }) {
    const { data } = await getDb().from("ProjectUpdate").select("*").eq("id", args.where.id).single();
    return data;
  },
  async create(args: { data: { title: string; description: string; date: string; photos?: string[] } }) {
    const id = cuid();
    const { error } = await getDb().from("ProjectUpdate").insert({
      id, title: args.data.title, description: args.data.description,
      date: args.data.date, photos: JSON.stringify(args.data.photos || []),
    });
    if (error) throw new Error(error.message);
    return projectUpdate.findUnique({ where: { id } });
  },
  async update(args: { where: { id: string }; data: Record<string, any> }) {
    const existing = await projectUpdate.findUnique({ where: args.where }) as any;
    if (!existing) return null;
    const d = args.data;
    const updateData: Record<string, any> = {
      title: d.title ?? existing.title, description: d.description ?? existing.description,
      date: d.date ?? existing.date, updatedAt: new Date().toISOString(),
    };
    if (d.photos !== undefined) updateData.photos = JSON.stringify(d.photos);
    await getDb().from("ProjectUpdate").update(updateData).eq("id", args.where.id);
    return projectUpdate.findUnique({ where: args.where });
  },
  async delete(args: { where: { id: string } }) {
    await getDb().from("ProjectUpdate").delete().eq("id", args.where.id);
  },
};

const feedback = {
  async findMany() {
    const { data } = await getDb().from("Feedback").select("*").order("createdAt", { ascending: false });
    return data || [];
  },
  async findUnique(args: { where: { id: string } }) {
    const { data } = await getDb().from("Feedback").select("*").eq("id", args.where.id).single();
    return data;
  },
  async create(args: { data: { title: string; description: string; date: string; company?: string; person?: string; photos?: string[] } }) {
    const id = cuid();
    const { error } = await getDb().from("Feedback").insert({
      id, title: args.data.title, description: args.data.description,
      date: args.data.date, company: args.data.company || "", person: args.data.person || "",
      photos: JSON.stringify(args.data.photos || []),
    });
    if (error) throw new Error(error.message);
    return feedback.findUnique({ where: { id } });
  },
  async update(args: { where: { id: string }; data: Record<string, any> }) {
    const existing = await feedback.findUnique({ where: args.where }) as any;
    if (!existing) return null;
    const d = args.data;
    const updateData: Record<string, any> = {
      title: d.title ?? existing.title, description: d.description ?? existing.description,
      date: d.date ?? existing.date, company: d.company ?? existing.company,
      person: d.person ?? existing.person, updatedAt: new Date().toISOString(),
    };
    if (d.photos !== undefined) updateData.photos = JSON.stringify(d.photos);
    await getDb().from("Feedback").update(updateData).eq("id", args.where.id);
    return feedback.findUnique({ where: args.where });
  },
  async delete(args: { where: { id: string } }) {
    await getDb().from("Feedback").delete().eq("id", args.where.id);
  },
};

const photoLog = {
  async findMany(args?: { group?: string }) {
    let q = getDb().from("PhotoLog").select("*");
    if (args?.group) q = q.eq("group", args.group);
    const { data } = await q.order("createdAt", { ascending: false });
    return data || [];
  },
  async findUnique(args: { where: { id: string } }) {
    const { data } = await getDb().from("PhotoLog").select("*").eq("id", args.where.id).single();
    return data;
  },
  async create(args: { data: { group?: string; title: string; description?: string; date: string; photos?: string[] } }) {
    const id = cuid();
    const { error } = await getDb().from("PhotoLog").insert({
      id, group: args.data.group || "general", title: args.data.title, description: args.data.description || "",
      date: args.data.date, photos: JSON.stringify(args.data.photos || []),
    });
    if (error) throw new Error(error.message);
    return photoLog.findUnique({ where: { id } });
  },
  async update(args: { where: { id: string }; data: Record<string, any> }) {
    const existing = await photoLog.findUnique({ where: args.where }) as any;
    if (!existing) return null;
    const d = args.data;
    const updateData: Record<string, any> = {
      title: d.title ?? existing.title, description: d.description ?? existing.description,
      date: d.date ?? existing.date, updatedAt: new Date().toISOString(),
    };
    if (d.group !== undefined) updateData.group = d.group;
    if (d.photos !== undefined) updateData.photos = JSON.stringify(d.photos);
    await getDb().from("PhotoLog").update(updateData).eq("id", args.where.id);
    return photoLog.findUnique({ where: args.where });
  },
  async delete(args: { where: { id: string } }) {
    await getDb().from("PhotoLog").delete().eq("id", args.where.id);
  },
};

const chartData = {
  async findMany() {
    const { data } = await getDb().from("ChartData").select("*").order("day", { ascending: true });
    return data || [];
  },
  async findUnique(args: { where: { id: string } }) {
    const { data } = await getDb().from("ChartData").select("*").eq("id", args.where.id).single();
    return data;
  },
  async create(args: { data: { label: string; day: number; co2Control: number; co2Exp: number; o2Control: number; o2Exp: number; tempControl: number; tempExp: number; humidityControl: number; humidityExp: number } }) {
    const id = cuid();
    const d = args.data;
    const { error } = await getDb().from("ChartData").insert({
      id, label: d.label, day: d.day, co2Control: d.co2Control, co2Exp: d.co2Exp,
      o2Control: d.o2Control, o2Exp: d.o2Exp, tempControl: d.tempControl, tempExp: d.tempExp,
      humidityControl: d.humidityControl, humidityExp: d.humidityExp,
    });
    if (error) throw new Error(error.message);
    return chartData.findUnique({ where: { id } });
  },
  async update(args: { where: { id: string }; data: Record<string, any> }) {
    const existing = await chartData.findUnique({ where: args.where }) as any;
    if (!existing) return null;
    const d = args.data;
    const updateData: Record<string, any> = {};
    for (const key of ["label", "day", "co2Control", "co2Exp", "o2Control", "o2Exp", "tempControl", "tempExp", "humidityControl", "humidityExp"]) {
      if (d[key] !== undefined) updateData[key] = d[key];
    }
    await getDb().from("ChartData").update(updateData).eq("id", args.where.id);
    return chartData.findUnique({ where: args.where });
  },
  async delete(args: { where: { id: string } }) {
    await getDb().from("ChartData").delete().eq("id", args.where.id);
  },
  async deleteAll() {
    await getDb().from("ChartData").delete().neq("id", "__delete_all__");
  },
};

const teamHistory = {
  async findMany() {
    const { data } = await getDb().from("TeamHistory").select("*").order("position", { ascending: true }).order("year", { ascending: false });
    return data || [];
  },
  async findUnique(args: { where: { id: string } }) {
    const { data } = await getDb().from("TeamHistory").select("*").eq("id", args.where.id).single();
    return data;
  },
  async create(args: { data: { year: number; title: string; description: string; photos?: string[]; position?: number } }) {
    const id = cuid();
    const pos = args.data.position ?? 0;
    const { error } = await getDb().from("TeamHistory").insert({
      id, year: args.data.year, title: args.data.title,
      description: args.data.description, photos: JSON.stringify(args.data.photos || []),
      position: pos,
    });
    if (error) throw new Error(error.message);
    return teamHistory.findUnique({ where: { id } });
  },
  async update(args: { where: { id: string }; data: Record<string, any> }) {
    const existing = await teamHistory.findUnique({ where: args.where }) as any;
    if (!existing) return null;
    const d = args.data;
    const updateData: Record<string, any> = {
      title: d.title ?? existing.title, description: d.description ?? existing.description,
      year: d.year ?? existing.year, updatedAt: new Date().toISOString(),
    };
    if (d.photos !== undefined) updateData.photos = JSON.stringify(d.photos);
    if (d.position !== undefined) updateData.position = d.position;
    await getDb().from("TeamHistory").update(updateData).eq("id", args.where.id);
    return teamHistory.findUnique({ where: args.where });
  },
  async delete(args: { where: { id: string } }) {
    await getDb().from("TeamHistory").delete().eq("id", args.where.id);
  },
};

// ---------------------------------------------------------------------------
// Export
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
  teamHistory,
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
};
