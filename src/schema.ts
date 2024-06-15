import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  serial,
  timestamp,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("en"),
  registrationCountry: text("registration_country").default("US"),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  role: text("role").$type<"admin" | "user">(),
});

export const userRelations = relations(user, ({ many }) => ({
  profiles: many(profile),
}));

export const profile = pgTable("profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  selected: boolean("selected").notNull().default(false),
  ownerId: uuid("owner_id").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const profileRelations = relations(profile, ({ one, many }) => ({
  user: one(user, { fields: [profile.ownerId], references: [user.id] }),
  sessions: many(session),
}));

export const session = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  jwt: text("jwt").notNull().unique(),
  valid: boolean("valid").notNull().default(true),
  profileId: uuid("profile_id").notNull(),
  createdAt: timestamp("created_at"),
});

export const sessionRelations = relations(session, ({ one }) => ({
  profile: one(profile, {
    fields: [session.profileId],
    references: [profile.id],
  }),
}));
