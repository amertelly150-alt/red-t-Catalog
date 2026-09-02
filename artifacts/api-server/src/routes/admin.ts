import { Router, type IRouter } from 'express';
import {
  AdminLoginBody,
  AdminLoginResponse,
  CreateAdminProductBody,
  CreateAdminProductResponse,
  DeleteAdminProductParams,
  GetAdminCatalogResponse,
  GetAdminSessionResponse,
  UpdateAdminCategoriesBody,
  UpdateAdminCategoriesResponse,
  UpdateAdminProductBody,
  UpdateAdminProductParams,
  UpdateAdminProductResponse,
  UpdateAdminSiteBody,
  UpdateAdminSiteResponse,
} from '@workspace/api-zod';
import type { Category, Product, SiteSettings } from '@workspace/api-zod';
import {
  createProduct,
  deleteProduct,
  getCatalog,
  updateCategories,
  updateProduct,
  updateSiteSettings,
} from '../lib/catalog-store';
import {
  adminCredentialsConfigured,
  areAdminCredentialsValid,
  clearAdminSession,
  isAdminAuthenticated,
  requireAdmin,
  setAdminSession,
} from '../lib/admin-auth';

const router: IRouter = Router();

function isValidImageValue(image: string): boolean {
  if (image.startsWith('/images/')) return true;
  return /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(image) && image.length <= 5_500_000;
}

function validateProductReferences(product: Omit<Product, 'id'>, categories: Category[]): string | undefined {
  const category = categories.find((item) => item.name === product.category);
  if (!category) return 'اختر تصنيفًا رئيسيًا موجودًا.';
  if (!category.subcategories.includes(product.subcategory)) return 'اختر تصنيفًا فرعيًا موجودًا ضمن التصنيف الرئيسي.';
  if (!isValidImageValue(product.image)) return 'صورة المنتج غير صالحة أو كبيرة جدًا.';
  return undefined;
}

router.get('/admin/session', (req, res): void => {
  res.json(GetAdminSessionResponse.parse({ authenticated: isAdminAuthenticated(req) }));
});

router.post('/admin/login', (req, res): void => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'أدخل اسم المستخدم وكلمة المرور.' });
    return;
  }
  if (!adminCredentialsConfigured()) {
    res.status(503).json({ error: 'بيانات دخول الإدارة غير مهيأة بعد.' });
    return;
  }
  if (!areAdminCredentialsValid(parsed.data.username, parsed.data.password)) {
    res.status(401).json({ error: 'بيانات الدخول غير صحيحة.' });
    return;
  }
  setAdminSession(res);
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post('/admin/logout', (_req, res): void => {
  clearAdminSession(res);
  res.sendStatus(204);
});

router.get('/admin/catalog', requireAdmin, async (_req, res): Promise<void> => {
  const catalog = await getCatalog();
  res.json(GetAdminCatalogResponse.parse(catalog));
});

router.post('/admin/products', requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'راجع بيانات المنتج المطلوبة.' });
    return;
  }
  const catalog = await getCatalog();
  const product = parsed.data;
  const validationError = validateProductReferences(product, catalog.categories);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  const created = await createProduct(product);
  res.status(201).json(CreateAdminProductResponse.parse(created));
});

router.patch('/admin/products/:id', requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminProductParams.safeParse(req.params);
  const parsed = UpdateAdminProductBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: 'راجع رقم المنتج وبياناته.' });
    return;
  }
  const catalog = await getCatalog();
  const validationError = validateProductReferences(parsed.data, catalog.categories);
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }
  const updated = await updateProduct(params.data.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: 'المنتج غير موجود.' });
    return;
  }
  res.json(UpdateAdminProductResponse.parse(updated));
});

router.delete('/admin/products/:id', requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: 'رقم المنتج غير صالح.' });
    return;
  }
  const deleted = await deleteProduct(params.data.id);
  if (!deleted) {
    res.status(404).json({ error: 'المنتج غير موجود.' });
    return;
  }
  res.sendStatus(204);
});

router.put('/admin/site', requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminSiteBody.safeParse(req.body);
  if (!parsed.success || !isValidImageValue(parsed.data?.heroImage ?? '')) {
    res.status(400).json({ error: 'راجع صورة الهيرو والنصوص ورقم واتساب.' });
    return;
  }
  const updated = await updateSiteSettings(parsed.data as SiteSettings);
  res.json(UpdateAdminSiteResponse.parse(updated));
});

router.put('/admin/categories', requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminCategoriesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'أضف تصنيفًا رئيسيًا واحدًا على الأقل مع تصنيف فرعي.' });
    return;
  }
  const categories = parsed.data.categories as Category[];
  const names = categories.map((category) => category.name.trim());
  const duplicateNames = new Set(names).size !== names.length;
  const duplicateSubcategories = categories.some((category) => new Set(category.subcategories.map((value) => value.trim())).size !== category.subcategories.length);
  if (duplicateNames || duplicateSubcategories) {
    res.status(400).json({ error: 'لا يمكن تكرار أسماء التصنيفات أو التصنيفات الفرعية.' });
    return;
  }
  const catalog = await getCatalog();
  const invalidProduct = catalog.products.find((product) => {
    const category = categories.find((item) => item.name === product.category);
    return !category || !category.subcategories.includes(product.subcategory);
  });
  if (invalidProduct) {
    res.status(400).json({ error: `حدّث تصنيف المنتج «${invalidProduct.name}» أولًا قبل حذف أو إعادة تسمية التصنيف المرتبط به.` });
    return;
  }
  const updated = await updateCategories(categories);
  res.json(UpdateAdminCategoriesResponse.parse(updated));
});

export default router;