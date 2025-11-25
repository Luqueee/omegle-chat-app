// convex/schema.ts
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable, type TableDefinition } from "convex/server";
import { v } from "convex/values";

const uuidSchema = v.string();

const applicationTables = {
  channels: defineTable({
    closed: v.boolean(),
    user1Id: v.optional(v.id("users")),
    user2Id: v.optional(v.id("users")),
  })
    .index("by_user1_user2", ["user1Id", "user2Id"])
    .index("by_closed", ["closed"]),
  onlineUsers: defineTable({
    userId: v.id("users"),
    lastActiveAt: v.number(),
  }).index("by_last_active", ["lastActiveAt"]),
  images: defineTable({
    r2Key: v.string(),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("r2Key", ["r2Key"]),
};

export default defineSchema({
  // resto de tablas de auth (authSessions, authAccounts, etc)
  ...(authTables as unknown as Record<
    string,
    TableDefinition<any, any, any, any>
  >),
  ...applicationTables,

  // Sobrescribimos SOLO users, pero partiendo de la definición de Convex Auth
  users: defineTable({
    // campos que ya define Convex Auth
    name: v.string(),
    image: v.string(),
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    // campos extra tuyos
    bio: v.optional(v.string()),
    age: v.optional(v.number()),
  })
    // índices que ya existían
    .index("email", ["email"]),
  // índice extra tuyo
});
