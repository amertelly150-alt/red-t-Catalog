import { asc, eq, sql } from 'drizzle-orm';
import { db, catalogCategoriesTable, catalogProductsTable, catalogSiteSettingsTable } from '@workspace/db';
import { categories as defaultCategories, defaultSiteSettings, products as defaultProducts } from '@workspace/catalog-data';
import type { CatalogResponse, Category, Product, SiteSettings } from '@workspace/api-zod';

let seedPromise: Promise<void> | undefined;

function toProduct(row: typeof catalogProductsTable.$inferSelect): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    subcategory: row.subcategory,
    trending: row.trending,
    bestSeller: row.bestSeller,
    nameEn: row.nameEn,
    badge: row.badge,
    tone: row.tone,
  };
}

async function seedCatalog(): Promise<void> {
  await db.transaction(async (tx) => {
    const existingSettings = await tx.select({ id: catalogSiteSettingsTable.id }).from(catalogSiteSettingsTable).limit(1);
    if (existingSettings.length > 0) return;

    await tx.insert(catalogSiteSettingsTable).values({
      id: 1,
      heroImage: defaultSiteSettings.heroImage,
      heroHeadline: defaultSiteSettings.heroHeadline,
      heroDescription: defaultSiteSettings.heroDescription,
      whatsappNumber: defaultSiteSettings.whatsappNumber,
    });
    await tx.insert(catalogCategoriesTable).values(
      defaultCategories.map((category, index) => ({
        name: category.name,
        subcategories: [...category.subcategories],
        sortOrder: index,
      })),
    );
    await tx.insert(catalogProductsTable).values(
      defaultProducts.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory,
        trending: product.trending,
        bestSeller: product.bestSeller,
        nameEn: product.nameEn,
        badge: product.badge ?? null,
        tone: product.tone,
      })),
    );
  });
}

export async function ensureCatalogSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedCatalog().catch((error) => {
      seedPromise = undefined;
      throw error;
    });
  }
  await seedPromise;
}

export async function getCatalog(): Promise<CatalogResponse> {
  await ensureCatalogSeeded();
  const [productRows, categoryRows, settingsRows] = await Promise.all([
    db.select().from(catalogProductsTable).orderBy(asc(catalogProductsTable.id)),
    db.select().from(catalogCategoriesTable).orderBy(asc(catalogCategoriesTable.sortOrder), asc(catalogCategoriesTable.id)),
    db.select().from(catalogSiteSettingsTable).limit(1),
  ]);

  const settings = settingsRows[0];
  if (!settings) throw new Error('Catalog site settings are missing.');

  const site: SiteSettings = {
    heroImage: settings.heroImage,
    heroHeadline: settings.heroHeadline,
    heroDescription: settings.heroDescription,
    whatsappNumber: settings.whatsappNumber,
  };
  const categories: Category[] = categoryRows.map((row) => ({
    name: row.name,
    subcategories: row.subcategories,
  }));

  return {
    products: productRows.map(toProduct),
    categories,
    site,
  };
}

export async function getNextProductId(): Promise<number> {
  const result = await db.select({ maxId: sql<number>`coalesce(max(${catalogProductsTable.id}), 0)` }).from(catalogProductsTable);
  return Number(result[0]?.maxId ?? 0) + 1;
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const id = await getNextProductId();
  const [row] = await db.insert(catalogProductsTable).values({ id, ...product }).returning();
  return toProduct(row);
}

export async function updateProduct(id: number, product: Omit<Product, 'id'>): Promise<Product | undefined> {
  const [row] = await db.update(catalogProductsTable).set(product).where(eq(catalogProductsTable.id, id)).returning();
  return row ? toProduct(row) : undefined;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const deleted = await db.delete(catalogProductsTable).where(eq(catalogProductsTable.id, id)).returning({ id: catalogProductsTable.id });
  return deleted.length > 0;
}

export async function updateSiteSettings(site: SiteSettings): Promise<SiteSettings> {
  const [row] = await db.update(catalogSiteSettingsTable).set({
    heroImage: site.heroImage,
    heroHeadline: [site.heroHeadline[0], site.heroHeadline[1]],
    heroDescription: site.heroDescription,
    whatsappNumber: site.whatsappNumber,
  }).where(eq(catalogSiteSettingsTable.id, 1)).returning();
  if (!row) throw new Error('Catalog site settings are missing.');
  return {
    heroImage: row.heroImage,
    heroHeadline: row.heroHeadline,
    heroDescription: row.heroDescription,
    whatsappNumber: row.whatsappNumber,
  };
}

export async function updateCategories(categories: Category[]): Promise<Category[]> {
  await db.transaction(async (tx) => {
    await tx.delete(catalogCategoriesTable);
    await tx.insert(catalogCategoriesTable).values(
      categories.map((category, index) => ({
        name: category.name,
        subcategories: category.subcategories,
        sortOrder: index,
      })),
    );
  });
  return categories;
}