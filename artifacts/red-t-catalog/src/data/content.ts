export const content = {
  brandName: 'red-t',
  navigation: [
    { label: 'الرئيسية', href: '#top' },
    { label: 'الأكثر رواجاً', href: '#trending' },
    { label: 'الأكثر مبيعاً', href: '#bestsellers' },
    { label: 'الأصناف', href: '#categories' },
    { label: 'تواصل معنا', href: '#contact' },
  ],
  hero: {
    eyebrow: 'EST. 2024 / RIYADH',
    headline: ['اكتشف منتجاتك', 'المفضلة.'],
    description: 'قطع مختارة لمن يعيشون التفاصيل. ملابس، إكسسوارات، وأساسيات ترافقك من أول تشغيل إلى آخر محطة.',
    image: '/images/hero/hero-main.jpg',
    ctaText: 'تصفح المنتجات',
    scrollLabel: 'SCROLL TO EXPLORE',
  },
  story: {
    eyebrow: '01 / THE POINT OF VIEW',
    title: 'نصنع الأشياء التي تتحمل القصة.',
    description: 'red-t ليست مجموعة أخرى معلقة في الخزانة. هي امتداد لطريقتك في الحركة — خامات صادقة، تصميم نظيف، وحضور لا يحتاج إلى شرح.',
    linkText: 'شاهد ما وصل حديثاً',
  },
  trending: {
    eyebrow: '02 / TRENDING NOW',
    title: 'الأكثر رواجاً',
    description: 'قطع لفتت الأنظار واختارها مجتمع red-t هذا الأسبوع.',
    sideLabel: 'DROP 01 — 2024',
  },
  bestSellers: {
    eyebrow: '03 / BEST SELLERS',
    title: 'الأكثر مبيعاً',
    description: 'اختيارات موثوقة، مصممة لتبقى معك.',
  },
  categories: {
    eyebrow: '04 / SHOP BY CATEGORY',
    title: ['الأصناف', 'بطريقتك.'],
    description: 'اختر المسار الذي يناسبك، وستظهر لك القطع المرتبطة به مباشرة.',
  },
  products: {
    eyebrow: '05 / THE FULL CATALOG',
    title: 'كل المنتجات',
    description: 'قطع اختارها الطريق. تصفح المجموعة حسب مزاجك.',
    filterLabel: 'تصنيف المنتجات',
    emptyState: 'لا توجد قطع في هذا التصنيف حالياً.',
  },
  contact: {
    eyebrow: '04 / MAKE CONTACT',
    title: ['لقيت اللي بدك ياه؟', 'تبدأ برسالة.'],
    description: 'تواصل معنا واطلب منتجك مباشرة. نرد عليك بتفاصيل التوفر، المقاس، وطرق التوصيل.',
    note: '* رقم واتساب تجريبي قابل للتعديل لاحقاً',
  },
  footer: {
    statement: 'منتجات مميزة بتصميم مختلف.',
    copyright: '© 2024 RED-T STUDIO',
    closing: 'صُنع للحركة، لا للعرض فقط.',
  },
  tickerText: 'BUILT FOR THE LONG WAY',
  whatsapp: {
    productButton: 'اطلب عبر واتساب',
    genericButton: 'تواصل معنا عبر واتساب',
    productMessagePrefix: 'مرحباً، أريد طلب المنتج:',
    genericMessage: 'مرحباً، أريد معرفة المنتجات المتاحة لدى red-t.',
  },
  logoPath: '/images/logo/red-t-logo.png',
} as const;

// Change this one value only. Keep the country code and remove spaces or symbols.
export const WHATSAPP_NUMBER = '966500000000';