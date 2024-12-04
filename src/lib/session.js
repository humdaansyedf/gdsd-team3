const crypto = require("node:crypto");
const { sha256 } = require("@oslojs/crypto/sha2");
const { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } = require("@oslojs/encoding");
const { prisma } = require("../prisma");

function generateSessionToken() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

async function createSession(token, userId) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
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
          password: true,
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
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
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

module.exports = {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
};
