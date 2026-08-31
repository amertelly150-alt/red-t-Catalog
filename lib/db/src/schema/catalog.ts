import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const catalogProductsTable = pgTable('catalog_products', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: text('price').notNull(),
  image: text('image').notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory').notNull(),
  trending: boolean('trending').notNull().default(false),
  bestSeller: boolean('best_seller').notNull().default(false),
  nameEn: text('name_en').notNull().default(''),
  badge: text('badge'),
  tone: text('tone').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const catalogCategoriesTable = pgTable('catalog_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  subcategories: jsonb('subcategories').$type<string[]>().notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const catalogSiteSettingsTable = pgTable('catalog_site_settings', {
  id: integer('id').primaryKey().default(1),
  heroImage: text('hero_image').notNull(),
  heroHeadline: jsonb('hero_headline').$type<[string, string]>().notNull(),
  heroDescription: text('hero_description').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCatalogProductSchema = createInsertSchema(catalogProductsTable).omit({
  updatedAt: true,
});
export const insertCatalogCategorySchema = createInsertSchema(catalogCategoriesTable).omit({
  id: true,
  updatedAt: true,
});
export const insertCatalogSiteSettingsSchema = createInsertSchema(catalogSiteSettingsTable).omit({
  updatedAt: true,
});

export type CatalogProduct = typeof catalogProductsTable.$inferSelect;
export type CatalogCategory = typeof catalogCategoriesTable.$inferSelect;
export type CatalogSiteSettings = typeof catalogSiteSettingsTable.$inferSelect;