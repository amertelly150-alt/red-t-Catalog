export const ALL_CATEGORY = 'الكل';
export const ALL_SUBCATEGORY = 'الكل';

export type CategoryGroup = {
  name: string;
  subcategories: readonly string[];
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  subcategory: string;
  trending: boolean;
  bestSeller: boolean;
  nameEn: string;
  badge?: string | null;
  tone: string;
};

export type SiteSettings = {
  heroImage: string;
  heroHeadline: [string, string];
  heroDescription: string;
  whatsappNumber: string;
};

export const categories: readonly CategoryGroup[] = [
  {
    name: '🚗 منتجات السيارات',
    subcategories: ['BMW', 'Mercedes', 'Hyundai', 'Kia', 'Motorcycles', 'Other'],
  },
  {
    name: '🔑 ميداليات ومفاتيح',
    subcategories: ['سيارات', 'شخصيات', 'أسماء', 'أخرى'],
  },
  {
    name: '🖼️ لوحات',
    subcategories: ['رياضية', 'أنمي', 'سيارات', 'أفلام ومسلسلات', 'ألعاب', 'اقتباسات'],
  },
  {
    name: '🎁 هدايا',
    subcategories: ['رجالية', 'نسائية', 'مناسبات', 'مخصصة'],
  },
  {
    name: '⭐ منتجات مميزة',
    subcategories: ['إصدار محدود', 'أساسيات', 'أخرى'],
  },
];

export const categoryNames = [ALL_CATEGORY, ...categories.map((category) => category.name)];

export const products: readonly Product[] = [
  {
    id: 1,
    name: 'حقيبة الطريق',
    nameEn: 'THE ROAD CARRYALL',
    description: 'حقيبة يومية عملية بتفاصيل مستوحاة من الطريق.',
    price: '٣٨٥ ر.س',
    image: '/images/products/product-01.jpg',
    category: '🎁 هدايا',
    subcategory: 'رجالية',
    trending: true,
    bestSeller: true,
    badge: 'الأكثر طلباً',
    tone: 'أسود فحمي',
  },
  {
    id: 2,
    name: 'هودي الجراج',
    nameEn: 'GARAGE HOODIE 01',
    description: 'قطعة أساسية بقصة مريحة وحضور واضح.',
    price: '٢٩٥ ر.س',
    image: '/images/products/product-02.jpg',
    category: '⭐ منتجات مميزة',
    subcategory: 'إصدار محدود',
    trending: true,
    bestSeller: true,
    badge: 'إصدار محدود',
    tone: 'فحمي مغسول',
  },
  {
    id: 3,
    name: 'كوب المسافة',
    nameEn: 'DISTANCE TUMBLER',
    description: 'كوب حراري يرافقك من أول تشغيل إلى آخر محطة.',
    price: '١٤٥ ر.س',
    image: '/images/products/product-03.jpg',
    category: '🚗 منتجات السيارات',
    subcategory: 'Other',
    trending: true,
    bestSeller: true,
    tone: 'فولاذ مصقول',
  },
  {
    id: 4,
    name: 'لوحة المسار',
    nameEn: 'THE ROUTE PLATE',
    description: 'لوحة جدارية تضيف للمكان لمسة من روح الطريق.',
    price: '١٦٥ ر.س',
    image: '/images/products/product-04.jpg',
    category: '🖼️ لوحات',
    subcategory: 'سيارات',
    trending: true,
    bestSeller: false,
    tone: 'أسود وأحمر',
  },
  {
    id: 5,
    name: 'منظم الكونسول',
    nameEn: 'CONSOLE ORGANIZER',
    description: 'منظم مطبوع ثلاثي الأبعاد يحافظ على ترتيب سيارتك.',
    price: '١٢٥ ر.س',
    image: '/images/products/product-05.jpg',
    category: '🚗 منتجات السيارات',
    subcategory: 'Other',
    trending: false,
    bestSeller: true,
    tone: 'أسود مطفي',
  },
  {
    id: 6,
    name: 'حامل الجوال',
    nameEn: 'DRIVE PHONE MOUNT',
    description: 'حامل أنيق بثبات عملي ولمسة رياضية.',
    price: '١٣٥ ر.س',
    image: '/images/products/product-06.jpg',
    category: '🚗 منتجات السيارات',
    subcategory: 'Other',
    trending: false,
    bestSeller: false,
    tone: 'أسود وأحمر',
  },
  {
    id: 7,
    name: 'مجسم السيارة',
    nameEn: 'MOTION WALL RELIEF',
    description: 'قطعة جدارية بارزة مستوحاة من خطوط السيارات.',
    price: '٢٤٥ ر.س',
    image: '/images/products/product-07.jpg',
    category: '🖼️ لوحات',
    subcategory: 'سيارات',
    trending: true,
    bestSeller: false,
    badge: 'جديد',
    tone: 'فحمي عميق',
  },
  {
    id: 8,
    name: 'مقبض الترس',
    nameEn: 'GEAR SHIFT KNOB',
    description: 'تفصيلة مطبوعة ثلاثي الأبعاد تضيف شخصية للمقصورة.',
    price: '١٨٥ ر.س',
    image: '/images/products/product-08.jpg',
    category: '🚗 منتجات السيارات',
    subcategory: 'Other',
    trending: false,
    bestSeller: true,
    tone: 'أسود مع أحمر',
  },
  {
    id: 9,
    name: 'ميدالية العجلة',
    nameEn: 'WHEEL KEYCHAIN',
    description: 'ميدالية صغيرة تحمل روح red-t معك أينما ذهبت.',
    price: '٧٥ ر.س',
    image: '/images/products/product-09.jpg',
    category: '🔑 ميداليات ومفاتيح',
    subcategory: 'سيارات',
    trending: true,
    bestSeller: true,
    tone: 'أحمر سباقي',
  },
  {
    id: 10,
    name: 'منظم الأسلاك',
    nameEn: 'CABLE CLIPS SET',
    description: 'مجموعة عملية لترتيب أسلاك المكتب والسيارة.',
    price: '٦٥ ر.س',
    image: '/images/products/product-10.jpg',
    category: '⭐ منتجات مميزة',
    subcategory: 'أساسيات',
    trending: false,
    bestSeller: false,
    tone: 'أسود مطفي',
  },
  {
    id: 11,
    name: 'صندوق مفاتيح',
    nameEn: 'KEY TRAY GIFT SET',
    description: 'هدية أنيقة تجمع بين الاستخدام اليومي والتصميم المختلف.',
    price: '١٩٥ ر.س',
    image: '/images/products/product-11.jpg',
    category: '🎁 هدايا',
    subcategory: 'مناسبات',
    trending: false,
    bestSeller: true,
    badge: 'هدية مثالية',
    tone: 'فحمي وأحمر',
  },
  {
    id: 12,
    name: 'خوذة السباق',
    nameEn: 'RACING HELMET DECOR',
    description: 'مجسم ديكوري بطابع سباقي يكمّل مساحتك الخاصة.',
    price: '٢٢٥ ر.س',
    image: '/images/products/product-12.jpg',
    category: '🎁 هدايا',
    subcategory: 'رجالية',
    trending: true,
    bestSeller: false,
    tone: 'أسود لامع',
  },
];

export const defaultSiteSettings: SiteSettings = {
  heroImage: '/images/hero/hero-main.jpg',
  heroHeadline: ['اكتشف منتجاتك', 'المفضلة.'],
  heroDescription: 'قطع مختارة لمن يعيشون التفاصيل. ملابس، إكسسوارات، وأساسيات ترافقك من أول تشغيل إلى آخر محطة.',
  whatsappNumber: '966500000000',
};