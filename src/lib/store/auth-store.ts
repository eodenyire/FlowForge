import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { v4 as uuidv4 } from "uuid";
import type {
  User,
  PublicUser,
  Company,
  Session,
  UserRole,
  CompanySettings,
} from "@/lib/types";
import { writeJsonFile, readJsonFile, listFiles, deleteFile } from "@/lib/data/file-store";

const USERS_PREFIX = "auth/users/";
const COMPANIES_PREFIX = "auth/companies/";
const SESSIONS_PREFIX = "auth/sessions/";

// In-memory caches backed by disk
const usersCache = new Map<string, User>();
const companiesCache = new Map<string, Company>();
const sessionsCache = new Map<string, Session>();
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const userFiles = await listFiles(USERS_PREFIX);
    for (const file of userFiles) {
      if (file.endsWith(".json")) {
        const user = await readJsonFile<User>(`${USERS_PREFIX}${file}`);
        if (user) usersCache.set(user.id, user);
      }
    }
    const companyFiles = await listFiles(COMPANIES_PREFIX);
    for (const file of companyFiles) {
      if (file.endsWith(".json")) {
        const company = await readJsonFile<Company>(`${COMPANIES_PREFIX}${file}`);
        if (company) companiesCache.set(company.id, company);
      }
    }
    const sessionFiles = await listFiles(SESSIONS_PREFIX);
    for (const file of sessionFiles) {
      if (file.endsWith(".json")) {
        const session = await readJsonFile<Session>(`${SESSIONS_PREFIX}${file}`);
        if (session) sessionsCache.set(session.token, session);
      }
    }
  } catch {
    // First run
  }
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuffer, suppliedBuffer);
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    companyId: user.companyId,
    role: user.role,
    title: user.title,
    department: user.department,
    specializations: user.specializations,
    bio: user.bio,
    phone: user.phone,
    location: user.location,
    yearsExperience: user.yearsExperience,
    preferredLanguages: user.preferredLanguages,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// User operations
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  companyId?: string | null;
  role?: UserRole;
  title?: string;
  department?: string;
  specializations?: string[];
  bio?: string;
  phone?: string;
  location?: string;
  yearsExperience?: number;
  preferredLanguages?: string[];
}): Promise<User> {
  await ensureLoaded();

  // Check for existing email
  for (const user of usersCache.values()) {
    if (user.email === data.email) {
      throw new Error("A user with this email already exists");
    }
  }

  const now = new Date().toISOString();
  const user: User = {
    id: uuidv4(),
    email: data.email,
    name: data.name,
    passwordHash: hashPassword(data.password),
    companyId: data.companyId ?? null,
    role: data.role ?? "admin",
    title: data.title ?? "",
    department: data.department ?? "",
    specializations: data.specializations ?? [],
    bio: data.bio ?? "",
    phone: data.phone ?? "",
    location: data.location ?? "",
    yearsExperience: data.yearsExperience ?? 0,
    preferredLanguages: data.preferredLanguages ?? [],
    createdAt: now,
    updatedAt: now,
  };

  usersCache.set(user.id, user);
  await writeJsonFile(`${USERS_PREFIX}${user.id}.json`, user);
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  await ensureLoaded();
  return usersCache.get(id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  await ensureLoaded();
  for (const user of usersCache.values()) {
    if (user.email === email) return user;
  }
  return undefined;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  await ensureLoaded();
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  user.lastLoginAt = new Date().toISOString();
  usersCache.set(user.id, user);
  await writeJsonFile(`${USERS_PREFIX}${user.id}.json`, user);
  return user;
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User | undefined> {
  await ensureLoaded();
  const user = usersCache.get(id);
  if (!user) return undefined;
  const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
  usersCache.set(id, updated);
  await writeJsonFile(`${USERS_PREFIX}${id}.json`, updated);
  return updated;
}

export async function getUsersByCompany(companyId: string): Promise<PublicUser[]> {
  await ensureLoaded();
  return Array.from(usersCache.values())
    .filter((u) => u.companyId === companyId)
    .map(toPublicUser);
}

export async function deleteUser(id: string): Promise<boolean> {
  await ensureLoaded();
  usersCache.delete(id);
  await deleteFile(`${USERS_PREFIX}${id}.json`);
  return true;
}

// Session operations
export async function createSession(userId: string): Promise<Session> {
  await ensureLoaded();
  const token = randomBytes(32).toString("hex");
  const session: Session = {
    id: uuidv4(),
    userId,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString(),
  };
  sessionsCache.set(token, session);
  await writeJsonFile(`${SESSIONS_PREFIX}${session.id}.json`, session);
  return session;
}

export async function getSessionByToken(
  token: string
): Promise<{ session: Session; user: User; company: Company | null } | null> {
  await ensureLoaded();
  const session = sessionsCache.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    sessionsCache.delete(token);
    await deleteFile(`${SESSIONS_PREFIX}${session.id}.json`);
    return null;
  }
  const user = usersCache.get(session.userId);
  if (!user) return null;
  const company = user.companyId
    ? companiesCache.get(user.companyId) ?? null
    : null;
  return { session, user, company };
}

export async function deleteSession(token: string): Promise<boolean> {
  await ensureLoaded();
  const session = sessionsCache.get(token);
  if (!session) return false;
  sessionsCache.delete(token);
  await deleteFile(`${SESSIONS_PREFIX}${session.id}.json`);
  return true;
}

// Company operations
export async function createCompany(data: {
  name: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  logoUrl?: string;
  ownerId: string;
}): Promise<Company> {
  await ensureLoaded();
  const now = new Date().toISOString();
  const defaultSettings: CompanySettings = {
    defaultDataFormats: ["json", "csv"],
    maxFlowRetentionDays: 30,
    enableProvenance: true,
    allowedProcessorTypes: [],
  };
  const company: Company = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    industry: data.industry,
    size: data.size,
    website: data.website,
    logoUrl: data.logoUrl ?? "",
    ownerId: data.ownerId,
    settings: defaultSettings,
    createdAt: now,
    updatedAt: now,
  };
  companiesCache.set(company.id, company);
  await writeJsonFile(`${COMPANIES_PREFIX}${company.id}.json`, company);
  return company;
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
  await ensureLoaded();
  return companiesCache.get(id);
}

export async function updateCompany(
  id: string,
  updates: Partial<Company>
): Promise<Company | undefined> {
  await ensureLoaded();
  const company = companiesCache.get(id);
  if (!company) return undefined;
  const updated = {
    ...company,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  companiesCache.set(id, updated);
  await writeJsonFile(`${COMPANIES_PREFIX}${id}.json`, updated);
  return updated;
}

export async function deleteCompany(id: string): Promise<boolean> {
  await ensureLoaded();
  companiesCache.delete(id);
  await deleteFile(`${COMPANIES_PREFIX}${id}.json`);
  return true;
}

export { toPublicUser };
