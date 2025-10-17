import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep example user schema for template compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Photo booth element types
export const stickerSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  scaleX: z.number(),
  scaleY: z.number(),
});

export const textElementSchema = z.object({
  id: z.string(),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  fontSize: z.number(),
  fontFamily: z.string(),
  backgroundColor: z.enum(["red", "yellow"]),
  rotation: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const photoStateSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  orientation: z.enum(["landscape", "portrait"]),
  frameUrl: z.string().optional(),
  stickers: z.array(stickerSchema),
  textElements: z.array(textElementSchema),
});

// Available stickers in the library
export const stickerLibraryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  thumbnailUrl: z.string().optional(),
});

export type Sticker = z.infer<typeof stickerSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type PhotoState = z.infer<typeof photoStateSchema>;
export type StickerLibraryItem = z.infer<typeof stickerLibraryItemSchema>;

// Text background color options
export const textBackgroundColors = {
  red: {
    bg: "0 75% 45%",
    fg: "0 0% 100%",
    label: "Red",
  },
  yellow: {
    bg: "45 90% 55%",
    fg: "240 10% 12%",
    label: "Yellow",
  },
} as const;
