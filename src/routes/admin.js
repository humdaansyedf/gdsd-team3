import { getRandomValues } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { z } from "zod";
import { Router } from "express";
import { verify } from "@node-rs/argon2";
import { prisma } from "../prisma/index.js";
import { IS_DEV } from "../lib/utils.js";

// ADMIN AUTH UTILS
function generateSessionToken() {
  const bytes = new Uint8Array(20);
  getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

async function createAdminSession(token, adminId) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    adminId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
  };
  await prisma.adminSession.create({
    data: {
      id: session.id,
      adminId: session.adminId,
      expiresAt: session.expiresAt,
    },
  });
  return session;
}

async function validateAdminSessionToken(token) {
  try {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const result = await prisma.adminSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        id: true,
        expiresAt: true,
        admin: {
          omit: {
            passwordHash: true,
          },
        },
      },
    });

    if (result === null) {
      return { session: null, admin: null };
    }

    const { admin, ...session } = result;

    if (Date.now() >= session.expiresAt.getTime()) {
      await prisma.adminSession.delete({ where: { id: sessionId } });
      return { session: null, admin: null };
    }

    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 30);
      prisma.adminSession.update({
        where: {
          id: session.id,
        },
        data: {
          expiresAt: session.expiresAt,
        },
      });
    }

    return { session, admin };
  } catch (e) {
    console.log(e);
    return { session: null, admin: null };
  }
}

async function invalidateAdminSession(sessionId) {
  await prisma.adminSession.delete({ where: { id: sessionId } });
}

// ADMIN AUTH MIDDLEWARE
export async function adminAuthMiddleware(req, res, next) {
  const token = req.cookies.admin_auth_session;
  if (token === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { session, admin } = await validateAdminSessionToken(token);
  if (session === null) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.admin = admin;
  req.adminSession = session;
  next();
}

// ADMIN AUTH ROUTES
export const adminRouter = Router();

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
adminRouter.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
    return;
  }

  const { email, password } = result.data;

  const admin = await prisma.admin.findFirst({
    where: {
      email: email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!admin) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  const validPassword = await verify(admin.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  try {
    const token = generateSessionToken();
    const session = await createAdminSession(token, admin.id);

    res.cookie("admin_auth_session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: session.expiresAt,
      secure: !IS_DEV,
    });
    res.json({ message: "Logged in" });
    return;
  } catch (e) {
    res.status(400).json({ message: "Failed to log in" });
    return;
  }
});

adminRouter.post("/logout", adminAuthMiddleware, async (req, res) => {
  try {
    await invalidateAdminSession(req.adminSession.id);

    res.clearCookie("admin_auth_session", {
      httpOnly: true,
      sameSite: "lax",
      secure: !IS_DEV,
    });

    res.json({ message: "Logged out" });
    return;
  } catch (e) {
    res.status(400).json({ message: "Failed to log out" });
    return;
  }
});

adminRouter.get("/me", adminAuthMiddleware, async (req, res) => {
  res.json(req.admin);
  return;
});

// ADMIN PROPERTY ROUTES

// Get all properties
adminRouter.get("/property", adminAuthMiddleware, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        media: true,
      },
    });
    res.json(
      properties.map((property) => {
        // Get the first media item as the featured image
        const featuredMedia = property.media[0];
        return {
          ...property,
          media: featuredMedia ? featuredMedia.url : "https://gdsd.s3.eu-central-1.amazonaws.com/public/fulda.png",
        };
      })
    );
    return;
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
    return;
  }
});

// Get a single property
adminRouter.get("/property/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const property = await prisma.property.findUnique({
    where: {
      id,
    },
    include: {
      media: true,
    },
  });

  if (!property) {
    res.status(404).json({ error: "property not found" });
    return;
  }

  res.json(property);
  return;
});

// Update property status
const propertyStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "REJECTED"]),
  adminComment: z.string().nullish(),
});

adminRouter.patch("/property/:id/status", adminAuthMiddleware, async (req, res) => {
  const data = req.body;
  const result = propertyStatusSchema.safeParse(data);

  console.log(result);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const id = parseInt(req.params.id);

  try {
    const property = await prisma.property.update({
      where: {
        id,
      },
      data: {
        status: result.data.status,
        adminComment: result.data.adminComment,
      },
    });

    res.json({
      message: "Property status updated",
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update property status",
    });
  }
});
