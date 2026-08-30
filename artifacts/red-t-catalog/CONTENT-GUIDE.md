# دليل إدارة محتوى red-t

هذا الموقع لا يحتاج إلى لوحة تحكم. لتعديل المحتوى، افتح الملفات الموضحة أدناه داخل Replit. التصميم سيبقى كما هو؛ أنت تغيّر البيانات فقط.

## 1. تغيير الشعار

الشعار الحالي موجود هنا:

```text
public/images/logo/red-t-logo.png
```

استبدل الملف بصورة الشعار الجديدة بنفس الاسم، أو غيّر المسار في:

```text
src/data/content.ts
```

داخل السطر:

```ts
logoPath: '/images/logo/red-t-logo.png'
```

يفضل أن تكون الصورة PNG واضحة وبخلفية مناسبة.

## 2. تغيير صورة الهيرو

ضع الصورة الرئيسية في هذا المجلد:

```text
public/images/hero/
```

مثال:

```text
public/images/hero/hero-main.jpg
```

بعد رفع الصورة، افتح:

```text
src/data/content.ts
```

وغيّر هذا السطر إلى اسم الصورة الجديدة:

```ts
image: '/images/hero/hero-main.jpg'
```

## 3. تغيير النصوص الرئيسية

كل النصوص الرئيسية موجودة في ملف واحد:

```text
src/data/content.ts
```

يمكنك تعديل:

- عنوان الهيرو داخل `hero.headline`
- وصف الهيرو داخل `hero.description`
- نص زر الهيرو داخل `hero.ctaText`
- عناوين الأقسام داخل `story` و`trending` و`bestSellers` و`categories` و`products`
- نص CTA واتساب داخل `contact`
- نص الفوتر داخل `footer`

مثال لتغيير وصف الهيرو:

```ts
description: 'منتجات مختلفة صنعت لترافق تفاصيل يومك.'
```

## 4. تغيير رقم واتساب

رقم واتساب موجود مرة واحدة فقط في:

```text
src/data/content.ts
```

غيّر قيمة `WHATSAPP_NUMBER` فقط:

```ts
export const WHATSAPP_NUMBER = '966500000000';
```

اكتب الرقم بالصيغة الدولية، بدون علامة `+` وبدون مسافات. مثال السعودية:

```ts
export const WHATSAPP_NUMBER = '9665XXXXXXXX';
```

جميع أزرار واتساب تستخدم هذا الرقم تلقائيًا.

## 5. صور المنتجات

ضع كل صور المنتجات داخل:

```text
public/images/products/
```

الصور التجريبية الحالية موجودة بأسماء:

```text
product-01.jpg
product-02.jpg
...
product-12.jpg
```

لا تحتاج إلى تغيير التصميم عند استبدال صورة. ارفع الصورة الجديدة، ثم غيّر اسم الملف في بيانات المنتج فقط.

مثال:

```ts
image: '/images/products/my-real-product.jpg'
```

## 6. تغيير منتج موجود

جميع المنتجات موجودة في ملف واحد:

```text
src/data/products.ts
```

مثال منتج:

```ts
{
  id: 1,
  name: 'حقيبة الطريق',
  description: 'حقيبة يومية عملية بتفاصيل مستوحاة من الطريق.',
  price: '٣٨٥ ر.س',
  image: '/images/products/product-01.jpg',
  category: '🎁 هدايا',
  trending: true,
  bestSeller: true,
}
```

لتغيير الاسم، عدّل قيمة `name`:

```ts
name: 'اسم المنتج الجديد'
```

لتغيير الوصف:

```ts
description: 'وصف المنتج الجديد هنا.'
```

لتغيير السعر:

```ts
price: '١٥٠ ر.س'
```

ولتغيير الصورة:

```ts
image: '/images/products/product-13.jpg'
```

## 7. تغيير التصنيف

ضع اسم التصنيف نفسه الموجود في قائمة `categories`:

```ts
category: '🚗 منتجات السيارات'
```

إذا استخدمت اسمًا مختلفًا عن القائمة، فلن يظهر المنتج عند اختيار ذلك التصنيف.

## 8. Trending و Best Seller

لإظهار المنتج في قسم «الأكثر رواجاً»:

```ts
trending: true
```

لإظهار المنتج في قسم «الأكثر مبيعاً»:

```ts
bestSeller: true
```

لإخفائه من أحد القسمين:

```ts
trending: false
bestSeller: false
```

يمكن أن يكون المنتج في القسمين معًا أو في قسم واحد فقط.

## 9. إضافة تصنيف جديد

افتح `src/data/products.ts` وأضف اسم التصنيف إلى قائمة `categories`:

```ts
export const categories = [
  'الكل',
  '🚗 منتجات السيارات',
  '🔑 ميداليات ومفاتيح',
  '🖼️ لوحات',
  '🎁 هدايا',
  '⭐ منتجات مميزة',
  '🆕 تصنيف جديد',
] as const;
```

بعد ذلك استخدم الاسم نفسه داخل المنتج:

```ts
category: '🆕 تصنيف جديد'
```

## 10. إضافة منتج جديد

1. ارفع صورة المنتج إلى `public/images/products/`.
2. افتح `src/data/products.ts`.
3. أضف كائنًا جديدًا داخل مصفوفة `products`.

مثال:

```ts
{
  id: 13,
  name: 'اسم المنتج',
  nameEn: 'NEW PRODUCT',
  description: 'وصف المنتج',
  price: 'السعر',
  image: '/images/products/product-13.jpg',
  category: '🔑 ميداليات ومفاتيح',
  trending: false,
  bestSeller: true,
  tone: 'أسود مطفي',
}
```

سيظهر المنتج تلقائيًا في الكتالوج، وفي قسم «الأكثر مبيعاً» لأن `bestSeller` قيمتها `true`. وسيظهر داخل التصنيف المحدد عند اختياره.

بعد التعديل، احفظ الملفات وانتظر تحديث المعاينة. لا تحتاج إلى تعديل مكونات البطاقات أو CSS.