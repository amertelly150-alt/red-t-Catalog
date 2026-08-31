import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Check, ImagePlus, LogOut, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import type {
  Category,
  CatalogResponse,
  Product,
  ProductInput,
  SiteSettingsInput,
  SessionResponse,
} from '@workspace/api-zod';
import { defaultSiteSettings } from '@workspace/catalog-data';

type ProductForm = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  subcategory: string;
  trending: boolean;
  bestSeller: boolean;
  nameEn: string;
  badge: string;
  tone: string;
};

type Notice = { tone: 'success' | 'error'; text: string } | null;

async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const response = await fetch(url, { ...init, headers, credentials: 'same-origin' });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;
  if (!response.ok) {
    throw new Error(payload?.error || 'حدث خطأ غير متوقع.');
  }
  return payload as T;
}

function emptyProduct(categories: Category[]): ProductForm {
  const category = categories[0];
  return {
    name: '',
    description: '',
    price: '',
    image: '',
    category: category?.name ?? '',
    subcategory: category?.subcategories[0] ?? '',
    trending: false,
    bestSeller: false,
    nameEn: '',
    badge: '',
    tone: '',
  };
}

function productToForm(product: Product | undefined, categories: Category[]): ProductForm {
  if (!product) return emptyProduct(categories);
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    subcategory: product.subcategory,
    trending: product.trending,
    bestSeller: product.bestSeller,
    nameEn: product.nameEn,
    badge: product.badge ?? '',
    tone: product.tone,
  };
}

async function compressImage(file: File): Promise<string> {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('تعذر تحميل الصورة.'));
    element.src = source;
  });
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('تعذر تجهيز الصورة.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

function AdminFrame({
  children,
  onLogout,
  tab,
  setTab,
}: {
  children: React.ReactNode;
  onLogout: () => void;
  tab: 'products' | 'site' | 'categories';
  setTab: (tab: 'products' | 'site' | 'categories') => void;
}) {
  return (
    <main className="min-h-screen bg-[#f2efe8] text-[#171516]" dir="rtl">
      <header className="bg-[#171516] text-[#f2efe8]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <div>
            <p className="font-mono text-[10px] tracking-[.18em] text-[#d20b18]">RED-T / CONTROL ROOM</p>
            <h1 className="mt-2 text-xl font-semibold">لوحة إدارة الكتالوج</h1>
          </div>
          <button onClick={onLogout} className="inline-flex items-center gap-2 rounded-full border border-[#f2efe8]/25 px-4 py-2 text-xs text-[#f2efe8]/80 transition hover:border-[#d20b18] hover:bg-[#d20b18]">
            <LogOut size={15} />
            خروج
          </button>
        </div>
        <nav className="mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-12">
          {([
            ['products', 'المنتجات'],
            ['site', 'الواجهة والاتصال'],
            ['categories', 'التصنيفات'],
          ] as const).map(([value, label]) => (
            <button key={value} onClick={() => setTab(value)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs transition ${tab === value ? 'bg-[#d20b18] text-[#f2efe8]' : 'bg-[#f2efe8]/10 text-[#f2efe8]/65 hover:bg-[#f2efe8]/20 hover:text-[#f2efe8]'}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8 lg:px-12">{children}</div>
    </main>
  );
}

function ProductEditor({
  product,
  categories,
  onSaved,
  onDeleted,
  onCancel,
  setNotice,
}: {
  product?: Product;
  categories: Category[];
  onSaved: (id: number) => Promise<void>;
  onDeleted: () => Promise<void>;
  onCancel: () => void;
  setNotice: (notice: Notice) => void;
}) {
  const [form, setForm] = useState<ProductForm>(() => productToForm(product, categories));
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  useEffect(() => {
    setForm(productToForm(product, categories));
  }, [product?.id, categories]);

  const selectedCategory = categories.find((category) => category.name === form.category);
  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectImage = async (file: File | undefined) => {
    if (!file) return;
    setImageBusy(true);
    try {
      setField('image', await compressImage(file));
      setNotice({ tone: 'success', text: 'تم تجهيز الصورة، احفظ المنتج لتثبيتها.' });
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر تجهيز الصورة.' });
    } finally {
      setImageBusy(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const payload: ProductInput = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
      image: form.image.trim(),
      category: form.category.trim(),
      subcategory: form.subcategory.trim(),
      nameEn: form.nameEn.trim(),
      badge: form.badge.trim() || null,
      tone: form.tone.trim(),
    };
    try {
      const saved = product
        ? await requestJson<Product>(`/api/admin/products/${product.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await requestJson<Product>('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      setNotice({ tone: 'success', text: product ? 'تم حفظ تعديلات المنتج.' : 'تمت إضافة المنتج.' });
      await onSaved(saved.id);
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر حفظ المنتج.' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!product || !window.confirm(`هل تريد حذف «${product.name}» نهائيًا؟`)) return;
    setSaving(true);
    try {
      await requestJson<void>(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      setNotice({ tone: 'success', text: 'تم حذف المنتج.' });
      await onDeleted();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر حذف المنتج.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[4px] border border-[#c9c4b9] bg-[#fbfaf7] p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[.16em] text-[#d20b18]">{product ? `EDIT / ${String(product.id).padStart(2, '0')}` : 'NEW PRODUCT'}</p>
          <h2 className="mt-2 text-2xl font-semibold">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
        </div>
        {product && <button type="button" onClick={onCancel} className="rounded-full p-2 text-[#6e6961] hover:bg-[#e3dfd6]" aria-label="إغلاق"><X size={18} /></button>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="اسم المنتج" value={form.name} onChange={(value) => setField('name', value)} required />
        <Field label="الاسم بالإنجليزية" value={form.nameEn} onChange={(value) => setField('nameEn', value)} />
        <Field label="السعر" value={form.price} onChange={(value) => setField('price', value)} placeholder="مثال: ٢٩٥ ر.س" />
        <Field label="النغمة / الخامة" value={form.tone} onChange={(value) => setField('tone', value)} />
        <label className="block">
          <span className="mb-2 block text-xs font-semibold">التصنيف الرئيسي</span>
          <select value={form.category} onChange={(event) => {
            const next = categories.find((category) => category.name === event.target.value);
            setForm((current) => ({ ...current, category: event.target.value, subcategory: next?.subcategories[0] ?? '' }));
          }} className="admin-input">
            {categories.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold">التصنيف الفرعي</span>
          <select value={form.subcategory} onChange={(event) => setField('subcategory', event.target.value)} className="admin-input">
            {(selectedCategory?.subcategories ?? []).map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
          </select>
        </label>
        <Field label="الشارة" value={form.badge} onChange={(value) => setField('badge', value)} placeholder="مثال: جديد" />
        <label className="block">
          <span className="mb-2 block text-xs font-semibold">الصورة</span>
          <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[3px] border border-dashed border-[#a9a398] bg-[#f2efe8] px-3 text-xs transition hover:border-[#d20b18]">
            <Upload size={16} />
            {imageBusy ? 'جارٍ تجهيز الصورة...' : 'اختيار صورة وضغطها'}
            <input type="file" accept="image/*" className="hidden" disabled={imageBusy} onChange={(event) => void selectImage(event.target.files?.[0])} />
          </label>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold">الوصف</span>
        <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} rows={3} className="admin-input resize-y" />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-[3px] border border-[#c9c4b9] px-3 py-3 text-sm">
          <input type="checkbox" checked={form.trending} onChange={(event) => setField('trending', event.target.checked)} className="h-4 w-4 accent-[#d20b18]" />
          يظهر في قسم الأكثر رواجًا
        </label>
        <label className="flex items-center gap-3 rounded-[3px] border border-[#c9c4b9] px-3 py-3 text-sm">
          <input type="checkbox" checked={form.bestSeller} onChange={(event) => setField('bestSeller', event.target.checked)} className="h-4 w-4 accent-[#d20b18]" />
          يظهر في الأكثر مبيعًا
        </label>
      </div>

      {form.image && (
        <div className="mt-5 overflow-hidden rounded-[3px] bg-[#e3dfd6]">
          <img src={form.image} alt="معاينة المنتج" className="h-48 w-full object-cover sm:h-64" />
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {product ? <button type="button" onClick={() => void remove()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d20b18]/40 px-5 py-3 text-xs font-semibold text-[#b20b2a] transition hover:bg-[#d20b18] hover:text-[#f2efe8] disabled:opacity-50"><Trash2 size={15} /> حذف المنتج</button> : <span />}
        <button type="submit" disabled={saving || imageBusy} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171516] px-6 py-3 text-xs font-semibold text-[#f2efe8] transition hover:bg-[#d20b18] disabled:opacity-50"><Save size={15} /> {saving ? 'جارٍ الحفظ...' : 'حفظ المنتج'}</button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold">{label}</span>
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="admin-input" />
    </label>
  );
}

function SiteEditor({ site, onSaved, setNotice }: { site: CatalogResponse['site']; onSaved: (site: CatalogResponse['site']) => void; setNotice: (notice: Notice) => void }) {
  const [form, setForm] = useState<SiteSettingsInput>(() => ({
    heroImage: site.heroImage,
    heroHeadline: [...site.heroHeadline],
    heroDescription: site.heroDescription,
    whatsappNumber: site.whatsappNumber,
  }));
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  useEffect(() => {
    setForm({ heroImage: site.heroImage, heroHeadline: [...site.heroHeadline], heroDescription: site.heroDescription, whatsappNumber: site.whatsappNumber });
  }, [site]);

  const setHeadline = (index: 0 | 1, value: string) => {
    setForm((current) => {
      const headline = [...current.heroHeadline];
      headline[index] = value;
      return { ...current, heroHeadline: headline };
    });
  };

  const selectImage = async (file: File | undefined) => {
    if (!file) return;
    setImageBusy(true);
    try {
      const heroImage = await compressImage(file);
      setForm((current) => ({ ...current, heroImage }));
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر تجهيز صورة الهيرو.' });
    } finally {
      setImageBusy(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const saved = await requestJson<CatalogResponse['site']>('/api/admin/site', { method: 'PUT', body: JSON.stringify(form) });
      onSaved(saved);
      setNotice({ tone: 'success', text: 'تم حفظ إعدادات الواجهة.' });
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر حفظ إعدادات الواجهة.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl rounded-[4px] border border-[#c9c4b9] bg-[#fbfaf7] p-5 shadow-sm sm:p-8">
      <SectionTitle eyebrow="SITE / SETTINGS" title="الواجهة والاتصال" description="غيّر صورة الهيرو، الرسالة الرئيسية، ورقم واتساب الذي تستقبل عليه الطلبات." />
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Field label="السطر الأول من العنوان" value={form.heroHeadline[0] ?? ''} onChange={(value) => setHeadline(0, value)} required />
        <Field label="السطر الثاني من العنوان" value={form.heroHeadline[1] ?? ''} onChange={(value) => setHeadline(1, value)} required />
        <Field label="رقم واتساب الدولي بدون +" value={form.whatsappNumber} onChange={(value) => setForm((current) => ({ ...current, whatsappNumber: value.replace(/\D/g, '') }))} placeholder="9665XXXXXXXX" required />
        <label className="block">
          <span className="mb-2 block text-xs font-semibold">صورة الهيرو</span>
          <label className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[3px] border border-dashed border-[#a9a398] bg-[#f2efe8] px-3 text-xs transition hover:border-[#d20b18]">
            <ImagePlus size={16} />
            {imageBusy ? 'جارٍ تجهيز الصورة...' : 'اختيار صورة وضغطها'}
            <input type="file" accept="image/*" className="hidden" disabled={imageBusy} onChange={(event) => void selectImage(event.target.files?.[0])} />
          </label>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold">وصف الهيرو</span>
        <textarea value={form.heroDescription} onChange={(event) => setForm((current) => ({ ...current, heroDescription: event.target.value }))} rows={4} className="admin-input resize-y" />
      </label>
      {form.heroImage && <img src={form.heroImage} alt="معاينة صورة الهيرو" className="mt-6 h-56 w-full rounded-[3px] object-cover sm:h-72" />}
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={saving || imageBusy} className="inline-flex items-center gap-2 rounded-full bg-[#171516] px-6 py-3 text-xs font-semibold text-[#f2efe8] transition hover:bg-[#d20b18] disabled:opacity-50"><Save size={15} /> {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}</button>
      </div>
    </form>
  );
}

function CategoriesEditor({ categories, onSaved, setNotice }: { categories: Category[]; onSaved: (categories: Category[]) => void; setNotice: (notice: Notice) => void }) {
  const [draft, setDraft] = useState<Category[]>(categories);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(categories), [categories]);

  const updateCategory = (index: number, value: Partial<Category>) => {
    setDraft((current) => current.map((category, categoryIndex) => categoryIndex === index ? { ...category, ...value } : category));
  };
  const updateSubcategory = (categoryIndex: number, subcategoryIndex: number, value: string) => {
    setDraft((current) => current.map((category, index) => index === categoryIndex
      ? { ...category, subcategories: category.subcategories.map((item, itemIndex) => itemIndex === subcategoryIndex ? value : item) }
      : category));
  };
  const addCategory = () => setDraft((current) => [...current, { name: 'تصنيف جديد', subcategories: ['تصنيف فرعي جديد'] }]);
  const removeCategory = (index: number) => setDraft((current) => current.filter((_, categoryIndex) => categoryIndex !== index));
  const addSubcategory = (categoryIndex: number) => setDraft((current) => current.map((category, index) => index === categoryIndex ? { ...category, subcategories: [...category.subcategories, 'تصنيف فرعي جديد'] } : category));
  const removeSubcategory = (categoryIndex: number, subcategoryIndex: number) => setDraft((current) => current.map((category, index) => index === categoryIndex ? { ...category, subcategories: category.subcategories.filter((_, itemIndex) => itemIndex !== subcategoryIndex) } : category));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    const normalized = draft.map((category) => ({ name: category.name.trim(), subcategories: category.subcategories.map((item) => item.trim()) }));
    try {
      const saved = await requestJson<Category[]>('/api/admin/categories', { method: 'PUT', body: JSON.stringify({ categories: normalized }) });
      onSaved(saved);
      setNotice({ tone: 'success', text: 'تم حفظ التصنيفات.' });
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر حفظ التصنيفات.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl rounded-[4px] border border-[#c9c4b9] bg-[#fbfaf7] p-5 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <SectionTitle eyebrow="CATALOG / TAXONOMY" title="التصنيفات" description="أدر التصنيفات الرئيسية والتصنيفات الفرعية التي تظهر في فلترة المنتجات." />
        <button type="button" onClick={addCategory} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#171516] px-4 py-2.5 text-xs font-semibold transition hover:bg-[#171516] hover:text-[#f2efe8]"><Plus size={15} /> تصنيف رئيسي</button>
      </div>
      <div className="mt-7 space-y-4">
        {draft.map((category, categoryIndex) => (
          <div key={`${categoryIndex}-${category.name}`} className="rounded-[3px] border border-[#c9c4b9] p-4">
            <div className="flex gap-3">
              <input value={category.name} onChange={(event) => updateCategory(categoryIndex, { name: event.target.value })} className="admin-input flex-1 font-semibold" aria-label="اسم التصنيف الرئيسي" />
              <button type="button" onClick={() => removeCategory(categoryIndex)} className="rounded-[3px] border border-[#d20b18]/30 px-3 text-[#b20b2a] hover:bg-[#d20b18] hover:text-[#f2efe8]" aria-label="حذف التصنيف"><Trash2 size={16} /></button>
            </div>
            <div className="mt-3 space-y-2 pr-4 sm:pr-8">
              {category.subcategories.map((subcategory, subcategoryIndex) => (
                <div key={`${subcategoryIndex}-${subcategory}`} className="flex gap-2">
                  <input value={subcategory} onChange={(event) => updateSubcategory(categoryIndex, subcategoryIndex, event.target.value)} className="admin-input flex-1 text-sm" aria-label="اسم التصنيف الفرعي" />
                  <button type="button" onClick={() => removeSubcategory(categoryIndex, subcategoryIndex)} className="rounded-[3px] px-3 text-[#6e6961] hover:bg-[#e3dfd6]" aria-label="حذف التصنيف الفرعي"><X size={15} /></button>
                </div>
              ))}
              <button type="button" onClick={() => addSubcategory(categoryIndex)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#b20b18]"><Plus size={14} /> تصنيف فرعي</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#171516] px-6 py-3 text-xs font-semibold text-[#f2efe8] transition hover:bg-[#d20b18] disabled:opacity-50"><Save size={15} /> {saving ? 'جارٍ الحفظ...' : 'حفظ التصنيفات'}</button>
      </div>
    </form>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[.16em] text-[#d20b18]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-7 text-[#6e6961]">{description}</p>
    </div>
  );
}

function LoginScreen({ onLogin, notice, setNotice }: { onLogin: () => void; notice: Notice; setNotice: (notice: Notice) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      await requestJson('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      setPassword('');
      onLogin();
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر تسجيل الدخول.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#171516] px-5 py-10 text-[#f2efe8]" dir="rtl">
      <form onSubmit={submit} className="w-full max-w-md rounded-[4px] border border-[#f2efe8]/15 bg-[#222021] p-6 shadow-2xl sm:p-9">
        <div className="mb-9 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[3px] bg-[#f7f6f3]">
          <img src="/images/logo.png" alt="red-t الشعار" className="h-full w-full object-contain" />
        </div>
        <p className="font-mono text-[10px] tracking-[.16em] text-[#d20b18]">RED-T / PRIVATE AREA</p>
        <h1 className="mt-3 text-3xl font-semibold">دخول الإدارة</h1>
        <p className="mt-3 text-sm leading-7 text-[#f2efe8]/55">هذه الصفحة خاصة بمالك الكتالوج ولا تظهر في تنقلات الزوار.</p>
        {notice && <Notice notice={notice} />}
        <div className="mt-7 space-y-4">
          <label className="block"><span className="mb-2 block text-xs text-[#f2efe8]/70">اسم المستخدم</span><input value={username} onChange={(event) => setUsername(event.target.value)} className="admin-input dark-input" autoComplete="username" required /></label>
          <label className="block"><span className="mb-2 block text-xs text-[#f2efe8]/70">كلمة المرور</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="admin-input dark-input" autoComplete="current-password" required /></label>
        </div>
        <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#d20b18] px-5 py-3 text-sm font-semibold transition hover:bg-[#f2efe8] hover:text-[#171516] disabled:opacity-50">{loading ? 'جارٍ التحقق...' : 'دخول آمن'}</button>
      </form>
    </main>
  );
}

function Notice({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <div className={`mt-4 flex items-start gap-2 rounded-[3px] px-3 py-3 text-xs leading-6 ${notice.tone === 'success' ? 'bg-[#dff1e4] text-[#216b38]' : 'bg-[#fbe1e1] text-[#a31d28]'}`}><Check size={15} className="mt-1 shrink-0" />{notice.text}</div>;
}

export default function Admin() {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [tab, setTab] = useState<'products' | 'site' | 'categories'>('products');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const refreshCatalog = async () => {
    const next = await requestJson<CatalogResponse>('/api/admin/catalog');
    setCatalog(next);
    return next;
  };

  useEffect(() => {
    let active = true;
    void requestJson<SessionResponse>('/api/admin/session')
      .then(async (session) => {
        if (!active) return;
        if (!session.authenticated) {
          setStatus('unauthenticated');
          return;
        }
        await refreshCatalog();
        if (active) setStatus('authenticated');
      })
      .catch((error) => {
        if (active) {
          setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'تعذر الاتصال بالخادم.' });
          setStatus('unauthenticated');
        }
      });
    return () => { active = false; };
  }, []);

  const selectedProduct = useMemo(() => catalog?.products.find((product) => product.id === selectedProductId), [catalog, selectedProductId]);
  const reloadAfterSave = async (id?: number) => {
    await refreshCatalog();
    if (id !== undefined) {
      setSelectedProductId(id);
      setCreating(false);
    }
  };

  const logout = async () => {
    await requestJson('/api/admin/logout', { method: 'POST' });
    setCatalog(null);
    setStatus('unauthenticated');
    setNotice(null);
  };

  if (status === 'checking') {
    return <main className="flex min-h-screen items-center justify-center bg-[#171516] text-[#f2efe8]" dir="rtl"><p className="text-sm text-[#f2efe8]/70">جارٍ فتح لوحة الإدارة...</p></main>;
  }
  if (status === 'unauthenticated') {
    return <LoginScreen notice={notice} setNotice={setNotice} onLogin={async () => { await refreshCatalog(); setStatus('authenticated'); }} />;
  }
  if (!catalog) return null;

  return (
    <AdminFrame onLogout={() => void logout()} tab={tab} setTab={(nextTab) => { setTab(nextTab); setNotice(null); }}>
      {notice && <Notice notice={notice} />}
      {tab === 'products' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(250px,.7fr)_minmax(0,1.3fr)]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><p className="font-mono text-[10px] tracking-[.16em] text-[#d20b18]">CATALOG / {catalog.products.length}</p><h2 className="mt-2 text-2xl font-semibold">المنتجات</h2></div>
              <button onClick={() => { setCreating(true); setSelectedProductId(null); setNotice(null); }} className="inline-flex items-center gap-1 rounded-full bg-[#d20b18] px-4 py-2.5 text-xs font-semibold text-[#f2efe8] transition hover:bg-[#171516]"><Plus size={15} /> إضافة</button>
            </div>
            <div className="space-y-2">
              {catalog.products.map((product) => (
                <button key={product.id} onClick={() => { setCreating(false); setSelectedProductId(product.id); setNotice(null); }} className={`flex w-full items-center gap-3 rounded-[3px] border p-2 text-right transition ${selectedProductId === product.id && !creating ? 'border-[#d20b18] bg-[#fbfaf7]' : 'border-transparent bg-[#e3dfd6] hover:border-[#c9c4b9]'}`}>
                  <img src={product.image} alt="" className="h-16 w-16 shrink-0 rounded-[2px] object-cover" />
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold">{product.name}</span><span className="mt-1 block truncate text-[11px] text-[#6e6961]">{product.category} · {product.price}</span></span>
                </button>
              ))}
            </div>
          </section>
          <section>
            {(creating || selectedProduct) ? (
              <ProductEditor
                key={creating ? 'new' : selectedProduct?.id}
                product={creating ? undefined : selectedProduct}
                categories={catalog.categories}
                setNotice={setNotice}
                onSaved={(id) => reloadAfterSave(id)}
                onDeleted={async () => { setSelectedProductId(null); setCreating(false); await reloadAfterSave(); }}
                onCancel={() => { setSelectedProductId(null); setCreating(false); }}
              />
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-[4px] border border-dashed border-[#c9c4b9] bg-[#fbfaf7] p-8 text-center"><div><p className="text-lg font-semibold">اختر منتجًا لتحريره</p><p className="mt-2 text-sm text-[#6e6961]">أو أضف منتجًا جديدًا من الزر أعلاه.</p></div></div>
            )}
          </section>
        </div>
      )}
      {tab === 'site' && <SiteEditor site={catalog.site} onSaved={(site) => setCatalog((current) => current ? { ...current, site } : current)} setNotice={setNotice} />}
      {tab === 'categories' && <CategoriesEditor categories={catalog.categories} onSaved={(categories) => setCatalog((current) => current ? { ...current, categories } : current)} setNotice={setNotice} />}
    </AdminFrame>
  );
}