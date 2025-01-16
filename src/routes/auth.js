import { getRandomValues } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { z } from "zod";
import { Router } from "express";
import { hash, verify } from "@node-rs/argon2";
import { prisma } from "../prisma/index.js";
import { IS_DEV } from "../lib/utils.js";

// AUTH UTILS
function generateSessionToken() {
  const bytes = new Uint8Array(20);
  getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

async function createSession(token, userId) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  };
  await prisma.session.create({
    data: {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
    },
  });
  return session;
}

async function validateSessionToken(token) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      expiresAt: true,
      user: {
        omit: {
          passwordHash: true,
        },
      },
    },
  });
  if (result === null) {
    return { session: null, user: null };
  }
  const { user, ...session } = result;
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 12) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }
  return { session, user };
}

async function invalidateSession(sessionId) {
  await prisma.session.delete({ where: { id: sessionId } });
}

// AUTH ROUTES
export const authRouter = Router();

const userType = z.enum(["STUDENT", "LANDLORD"]);
const registerSchema = z.discriminatedUnion("type", [
  z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    phone: z.string().optional(),
    address: z.string().optional(),
    type: userType.extract(["LANDLORD"]),
  }),
  z.object({
    email: z
      .string()
      .email("Invalid email address")
      .endsWith("hs-fulda.de", "Email must be a HS-Fulda email"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    phone: z.string().optional(),
    address: z.string().optional(),
    type: userType.extract(["STUDENT"]),
  }),
]);
authRouter.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const { email, password, name, type, phone, address } = result.data;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user) {
    return res
      .status(400)
      .json({ message: "User already exists. Please login." });
  }

  try {
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prisma.user.create({
      data: {
        email: email,
        passwordHash: passwordHash,
        name: name,
        type: type,
        phone: phone,
        address: address,
      },
    });

    return res.json({ message: "Signed up" });
  } catch (e) {
    req.log.error(e);
    return res.status(400).json({ message: "Failed to create user account" });
  }
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
authRouter.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const { email, password } = result.data;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const validPassword = await verify(user.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  try {
    const token = generateSessionToken();
    const session = await createSession(token, user.id);

    res.cookie("auth_session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: session.expiresAt,
      secure: !IS_DEV,
    });
    return res.json({ message: "Logged in" });
  } catch (e) {
    return res.status(400).json({ message: "Failed to log in" });
  }
});

authRouter.post("/logout", authMiddleware, async (req, res) => {
  try {
    await invalidateSession(req.session.id);

    res.clearCookie("auth_session", {
      httpOnly: true,
      sameSite: "lax",
      secure: !IS_DEV,
    });

    return res.json({ message: "Logged out" });
  } catch (e) {
    return res.status(400).json({ message: "Failed to log out" });
  }
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  return res.json(req.user);
});

authRouter.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid data",
      errors: result.error.errors,
    });
  }

  const { email, password } = result.data;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const validPassword = await verify(user.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  try {
    const token = generateSessionToken();
    const session = await createSession(token, user.id);

    res.cookie("auth_session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: session.expiresAt,
      secure: !IS_DEV,
    });
    return res.json({ message: "Logged in" });
  } catch (e) {
    return res.status(400).json({ message: "Failed to log in" });
  }
});

authRouter.post("/logout", authMiddleware, async (req, res) => {
  try {
    await invalidateSession(req.session.id);

    res.clearCookie("auth_session", {
      httpOnly: true,
      sameSite: "lax",
      secure: !IS_DEV,
    });

    return res.json({ message: "Logged out" });
  } catch (e) {
    return res.status(400).json({ message: "Failed to log out" });
  }
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  return res.json(req.user);
});

// AUTH MIDDLEWARE
export async function authMiddleware(req, res, next) {
  const token = req.cookies.auth_session;
  if (token === null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { session, user } = await validateSessionToken(token);
  if (session === null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  req.session = session;
  next();
}
