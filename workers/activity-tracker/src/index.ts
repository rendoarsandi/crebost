import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// Define a type for the environment bindings set in wrangler.toml
export interface Env {
  DB: D1Database; // Binding to the D1 Database
  // Add other bindings like KV, R2, or environment variables (e.g., JWT_SECRET) here
  // JWT_SECRET?: string;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware to initialize Prisma Client for each request
app.use('*', async (c, next) => {
  if (!c.get('prisma')) {
    const adapter = new PrismaD1(c.env.DB);
    const prisma = new PrismaClient({ adapter });
    c.set('prisma', prisma);
  }
  await next();
});

// Define the expected request body structure
interface TrackActivityPayload {
  token?: string; // User session token (can also be passed via Authorization header)
  promotionId?: string;
  activityType: 'VIEW' | 'LIKE' | 'COMMENT'; // Enforce specific activity types
  ipAddress?: string;
  userAgent?: string;
}

// Placeholder function for session token validation
// This needs to be implemented based on your auth system (e.g., NextAuth session, JWT)
async function validateTokenAndGetUserId(token: string, env: Env, prisma: PrismaClient): Promise<string | null> {
  // --- BEGIN SENSITIVE CODE ---
  // IMPORTANT: Replace this with actual token validation logic.
  // Example if using NextAuth.js with database sessions stored via Prisma:
  // This requires the Session model to be defined in your Prisma schema
  // and that NextAuth is configured to use Prisma as an adapter.
  /*
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true }, // Assuming a relation `user User @relation(fields: [userId], references: [id])` on Session model
    });

    if (session && session.expires > new Date() && session.user) {
      return session.userId; // Or session.user.id depending on your schema
    }
  } catch (e) {
    console.error("Token validation error (DB session):", e);
    return null;
  }
  */

  // Example if using JWT:
  // This requires a JWT library (e.g., 'jsonwebtoken' or 'jose') and a secret.
  /*
  if (!env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment bindings.");
    return null;
  }
  try {
    // const decoded = await verifyJwt(token, env.JWT_SECRET); // Implement verifyJwt using a library
    // return decoded.userId; // Assuming JWT payload contains userId
    // Example with a hypothetical verifyJwt function:
    // import { verify } from 'jsonwebtoken'; // Not directly usable in CF Workers without shims or wasm
    // Using a Web Crypto API compatible JWT library like 'jose' is recommended for Workers.
    // For 'jose':
    // import * as jose from 'jose';
    // const secret = new TextEncoder().encode(env.JWT_SECRET);
    // const { payload } = await jose.jwtVerify(token, secret);
    // return payload.sub; // Or payload.userId, depending on how JWT is structured
  } catch (e) {
    console.error("Token validation error (JWT):", e);
    return null;
  }
  */
  // --- END SENSITIVE CODE ---

  // FOR DEVELOPMENT/TESTING ONLY: Simple token check.
  // Replace with robust validation logic for production.
  if (token === "valid-token-for-testing") {
    // In a real scenario, this dummy ID should be a valid CUID of an existing user in your DB.
    // You might need to seed a test user or fetch one.
    // const testUser = await prisma.user.findFirst();
    // if (testUser) return testUser.id;
    // For now, we'll use a placeholder. This will likely fail FK constraint if not a real user CUID.
    return "cltestuser12345678901234567"; // Placeholder CUID-like string
  }
  return null;
}

app.post('/track', async (c) => {
  const prisma = c.get('prisma') as PrismaClient;
  let payload: TrackActivityPayload;

  try {
    payload = await c.req.json<TrackActivityPayload>();
  } catch (error) {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  if (!payload.activityType || !['VIEW', 'LIKE', 'COMMENT'].includes(payload.activityType)) {
    return c.json({ error: 'Missing or invalid activityType' }, 400);
  }
  // promotionId is optional for now, but if provided, should be a valid CUID.

  const authHeader = c.req.header('Authorization');
  const tokenFromBody = payload.token;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (tokenFromBody) {
    token = tokenFromBody;
  }

  if (!token) {
    return c.json({ error: 'Missing authentication token' }, 401);
  }

  const userId = await validateTokenAndGetUserId(token, c.env, prisma);
  if (!userId) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const ipAddress = payload.ipAddress || c.req.header('CF-Connecting-IP') || undefined;
  const userAgent = payload.userAgent || c.req.header('User-Agent') || undefined;

  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        userId: userId,
        promotionId: payload.promotionId || null, // Handle optional promotionId
        activityType: payload.activityType,
        ipAddress: ipAddress,
        userAgent: userAgent,
      },
    });
    return c.json({ message: 'Activity tracked successfully', activityId: activityLog.id }, 201);
  } catch (error: any) {
    console.error('Failed to create activity log:', error);
    if (error.code === 'P2003') { // Foreign key constraint failed
        if (error.meta?.field_name?.includes('userId')) {
             return c.json({ error: `Invalid userId: ${userId}. User does not exist. Ensure token validation returns a valid existing user CUID.` }, 400);
        }
        if (payload.promotionId && error.meta?.field_name?.includes('promotionId')) {
            return c.json({ error: `Invalid promotionId: ${payload.promotionId}. Promotion does not exist.` }, 400);
        }
    }
    return c.json({ error: 'Failed to track activity', details: error.message || String(error) }, 500);
  }
});

app.get('/', (c) => {
  return c.text('Activity Tracker Worker is running!');
});

export default app;
